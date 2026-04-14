import { useCallback, useEffect, useReducer, useRef } from "react";

import type {
	ChatConnectionStatus,
	ChatErrorEvent,
	ChatOutgoingEvent,
	ChatMessagePayload,
	ChatReceiveEvent,
	PresenceState,
} from "@/features/chat-messages/types";
import { env } from "@/shared/lib/env";

interface UseChatWebSocketOptions {
	conversationId?: number | null;
	accessToken?: string;
}

interface UseChatWebSocketResult {
	connectionStatus: ChatConnectionStatus;
	realtimeMessages: ChatMessagePayload[];
	presenceByUserId: Record<number, PresenceState>;
	typingByUserId: Record<number, boolean>;
	sendTyping: (isTyping: boolean) => void;
	lastError: string | null;
	closeCode: number | null;
}

function toWsBaseUrl(apiBaseUrl: string): string {
	const trimmedUrl = apiBaseUrl.trim().replace(/\/+$/, "");
	if (trimmedUrl.startsWith("https://")) {
		return `wss://${trimmedUrl.slice("https://".length)}`;
	}
	if (trimmedUrl.startsWith("http://")) {
		return `ws://${trimmedUrl.slice("http://".length)}`;
	}
	return trimmedUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isParticipantPayload(value: unknown): value is ChatMessagePayload["sender"] {
	if (!isRecord(value)) {
		return false;
	}
	return (
		typeof value.id === "number" &&
		typeof value.username === "string" &&
		typeof value.display_name === "string" &&
		typeof value.is_online === "boolean" &&
		(typeof value.last_seen_at === "string" || value.last_seen_at === null)
	);
}

function isChatMessagePayload(value: unknown): value is ChatMessagePayload {
	if (!isRecord(value)) {
		return false;
	}
	return (
		typeof value.id === "number" &&
		isParticipantPayload(value.sender) &&
		typeof value.body === "string" &&
		typeof value.created_at === "string"
	);
}

function toChatReceiveEvent(value: unknown): ChatReceiveEvent | null {
	if (!isRecord(value) || typeof value.type !== "string") {
		return null;
	}

	if (value.type === "message") {
		if (!isChatMessagePayload(value.message)) {
			return null;
		}
		return { type: "message", message: value.message };
	}

	if (value.type === "error") {
		if (value.detail !== undefined && typeof value.detail !== "string" && value.detail !== null) {
			return null;
		}
		if (value.errors !== undefined && !isRecord(value.errors)) {
			return null;
		}
		let errors: Record<string, string[] | string> | undefined;
		if (isRecord(value.errors)) {
			errors = {};
			for (const [key, item] of Object.entries(value.errors)) {
				if (typeof item === "string") {
					errors[key] = item;
					continue;
				}
				if (Array.isArray(item) && item.every((entry) => typeof entry === "string")) {
					errors[key] = item;
					continue;
				}
				return null;
			}
		}
		return {
			type: "error",
			detail: typeof value.detail === "string" ? value.detail : undefined,
			errors,
		};
	}

	if (value.type === "presence") {
		if (
			typeof value.user_id !== "number" ||
			typeof value.is_online !== "boolean" ||
			(typeof value.last_seen_at !== "string" && value.last_seen_at !== null)
		) {
			return null;
		}
		return {
			type: "presence",
			user_id: value.user_id,
			is_online: value.is_online,
			last_seen_at: typeof value.last_seen_at === "string" ? value.last_seen_at : null,
		};
	}

	if (value.type === "typing") {
		if (typeof value.user_id !== "number" || typeof value.is_typing !== "boolean") {
			return null;
		}

		return {
			type: "typing",
			user_id: value.user_id,
			is_typing: value.is_typing,
		};
	}
	return null;
}

interface ChatState {
	status: ChatConnectionStatus;
	realtimeMessages: ChatMessagePayload[];
	presenceByUserId: Record<number, PresenceState>;
	typingByUserId: Record<number, boolean>;
	lastError: string | null;
	closeCode: number | null;
}

type ChatAction =
	| { type: "reset" }
	| { type: "connect_start" }
	| { type: "open" }
	| { type: "socket_error"; error: string }
	| { type: "message"; message: ChatMessagePayload }
	| { type: "presence"; userId: number; state: PresenceState }
	| { type: "typing"; userId: number; isTyping: boolean }
	| { type: "chat_error"; error: string }
	| { type: "close"; code: number }
	| { type: "reconnecting"; code: number };

const initialChatState: ChatState = {
	status: "idle",
	realtimeMessages: [],
	presenceByUserId: {},
	typingByUserId: {},
	lastError: null,
	closeCode: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
	switch (action.type) {
		case "reset":
			return initialChatState;
		case "connect_start":
			return { ...initialChatState, status: "connecting" };
		case "open":
			return { ...state, status: "open", closeCode: null, lastError: null };
		case "socket_error":
			return { ...state, status: "error", lastError: action.error };
		case "message":
			return {
				...state,
				realtimeMessages: [...state.realtimeMessages, action.message],
				typingByUserId: { ...state.typingByUserId, [action.message.sender.id]: false },
			};
		case "presence":
			return { ...state, presenceByUserId: { ...state.presenceByUserId, [action.userId]: action.state } };
		case "typing":
			return { ...state, typingByUserId: { ...state.typingByUserId, [action.userId]: action.isTyping } };
		case "chat_error":
			return { ...state, lastError: action.error };
		case "close":
			return { ...state, status: "closed", closeCode: action.code };
		case "reconnecting":
			return { ...state, status: "connecting", closeCode: action.code };
	}
}

function toErrorMessage(event: ChatErrorEvent): string {
	if (event.detail) {
		return event.detail;
	}
	if (!event.errors) {
		return "Unknown chat error.";
	}
	return JSON.stringify(event.errors);
}

export function useChatWebSocket({ conversationId, accessToken }: UseChatWebSocketOptions): UseChatWebSocketResult {
	const socketRef = useRef<WebSocket | null>(null);
	const hasRetriedWithTokenRef = useRef(false);

	const [state, dispatch] = useReducer(chatReducer, initialChatState);

	useEffect(() => {
		if (!conversationId) {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
			dispatch({ type: "reset" });
			return;
		}

		let isCancelled = false;
		const wsBase = toWsBaseUrl(env.apiBaseUrl);
		const cleanToken = accessToken?.trim() || "";

		dispatch({ type: "connect_start" });
		hasRetriedWithTokenRef.current = false;

		const connect = (useToken: boolean) => {
			if (isCancelled) {
				return;
			}

			const tokenQuery = useToken ? `?token=${encodeURIComponent(cleanToken)}` : "";
			const socketUrl = `${wsBase}/ws/chat/${conversationId}/${tokenQuery}`;
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.onopen = () => {
				if (isCancelled) {
					return;
				}
				dispatch({ type: "open" });
			};

			socket.onerror = () => {
				if (isCancelled) {
					return;
				}
				dispatch({ type: "socket_error", error: "WebSocket connection error." });
			};

			socket.onmessage = (rawMessage) => {
				let parsed: unknown;
				try {
					parsed = JSON.parse(rawMessage.data);
				} catch {
					dispatch({ type: "chat_error", error: "Received invalid JSON from chat server." });
					return;
				}

				const event = toChatReceiveEvent(parsed);
				if (!event) {
					dispatch({ type: "chat_error", error: "Received unexpected chat event shape." });
					return;
				}

				if (event.type === "message") {
					dispatch({ type: "message", message: event.message });
					return;
				}

				if (event.type === "presence") {
					dispatch({
						type: "presence",
						userId: event.user_id,
						state: { is_online: event.is_online, last_seen_at: event.last_seen_at },
					});
					return;
				}

				if (event.type === "typing") {
					dispatch({ type: "typing", userId: event.user_id, isTyping: event.is_typing });
					return;
				}

				dispatch({ type: "chat_error", error: toErrorMessage(event) });
			};

			socket.onclose = (event) => {
				if (isCancelled) {
					return;
				}

				if (event.code === 4401 && cleanToken && !useToken && !hasRetriedWithTokenRef.current) {
					hasRetriedWithTokenRef.current = true;
					dispatch({ type: "reconnecting", code: event.code });
					connect(true);
					return;
				}

				dispatch({ type: "close", code: event.code });
			};
		};

		connect(false);

		return () => {
			isCancelled = true;
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		};
	}, [conversationId, accessToken]);

	const sendTyping = useCallback((isTyping: boolean) => {
		const socket = socketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			return;
		}

		const payload: ChatOutgoingEvent = {
			type: "typing",
			is_typing: isTyping,
		};
		socket.send(JSON.stringify(payload));
	}, []);

	return {
		connectionStatus: state.status,
		realtimeMessages: state.realtimeMessages,
		presenceByUserId: state.presenceByUserId,
		typingByUserId: state.typingByUserId,
		sendTyping,
		lastError: state.lastError,
		closeCode: state.closeCode,
	};
}
