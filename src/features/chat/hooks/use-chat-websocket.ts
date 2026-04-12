import { useCallback, useEffect, useRef, useState } from "react";

import type {
	ChatConnectionStatus,
	ChatErrorEvent,
	ChatMessagePayload,
	ChatReceiveEvent,
	ChatSendEvent,
	PresenceState,
} from "@/features/chat/types";
import { env } from "@/shared/lib/env";

interface UseChatWebSocketOptions {
	conversationId?: number | null;
	accessToken?: string;
}

interface UseChatWebSocketResult {
	connectionStatus: ChatConnectionStatus;
	realtimeMessages: ChatMessagePayload[];
	presenceByUserId: Record<number, PresenceState>;
	sendRealtime: (body: string) => void;
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

function isParticipantPayload(
	value: unknown,
): value is ChatMessagePayload["sender"] {
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
		if (
			value.detail !== undefined &&
			typeof value.detail !== "string" &&
			value.detail !== null
		) {
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
				if (
					Array.isArray(item) &&
					item.every((entry) => typeof entry === "string")
				) {
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
			last_seen_at:
				typeof value.last_seen_at === "string" ? value.last_seen_at : null,
		};
	}
	return null;
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

export function useChatWebSocket({
	conversationId,
	accessToken,
}: UseChatWebSocketOptions): UseChatWebSocketResult {
	const socketRef = useRef<WebSocket | null>(null);
	const hasRetriedWithTokenRef = useRef(false);

	const [status, setStatus] = useState<ChatConnectionStatus>("idle");
	const [realtimeMessages, setRealtimeMessages] = useState<
		ChatMessagePayload[]
	>([]);
	const [presenceByUserId, setPresenceByUserId] = useState<
		Record<number, PresenceState>
	>({});
	const [lastError, setLastError] = useState<string | null>(null);
	const [closeCode, setCloseCode] = useState<number | null>(null);

	useEffect(() => {
		if (!conversationId) {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
			setStatus("idle");
			setRealtimeMessages([]);
			setPresenceByUserId({});
			setLastError(null);
			setCloseCode(null);
			return;
		}

		let isCancelled = false;
		const wsBase = toWsBaseUrl(env.apiBaseUrl);
		const cleanToken = accessToken?.trim() || "";

		setRealtimeMessages([]);
		setPresenceByUserId({});
		setLastError(null);
		setCloseCode(null);
		setStatus("connecting");
		hasRetriedWithTokenRef.current = false;

		const connect = (useToken: boolean) => {
			if (isCancelled) {
				return;
			}

			const tokenQuery = useToken
				? `?token=${encodeURIComponent(cleanToken)}`
				: "";
			const socketUrl = `${wsBase}/ws/chat/${conversationId}/${tokenQuery}`;
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.onopen = () => {
				if (isCancelled) {
					return;
				}
				setStatus("open");
				setCloseCode(null);
				setLastError(null);
			};

			socket.onerror = () => {
				if (isCancelled) {
					return;
				}
				setStatus("error");
				setLastError("WebSocket connection error.");
			};

			socket.onmessage = (rawMessage) => {
				let parsed: unknown;
				try {
					parsed = JSON.parse(rawMessage.data);
				} catch {
					setLastError("Received invalid JSON from chat server.");
					return;
				}

				const event = toChatReceiveEvent(parsed);
				if (!event) {
					setLastError("Received unexpected chat event shape.");
					return;
				}

				if (event.type === "message") {
					setRealtimeMessages((previous) => [...previous, event.message]);
					return;
				}

				if (event.type === "presence") {
					setPresenceByUserId((previous) => ({
						...previous,
						[event.user_id]: {
							is_online: event.is_online,
							last_seen_at: event.last_seen_at,
						},
					}));
					return;
				}

				setLastError(toErrorMessage(event));
			};

			socket.onclose = (event) => {
				if (isCancelled) {
					return;
				}
				setCloseCode(event.code);

				if (
					event.code === 4401 &&
					cleanToken &&
					!useToken &&
					!hasRetriedWithTokenRef.current
				) {
					hasRetriedWithTokenRef.current = true;
					setStatus("connecting");
					connect(true);
					return;
				}

				setStatus("closed");
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

	const sendRealtime = useCallback((body: string) => {
		const socket = socketRef.current;
		const text = body.trim();

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			setLastError("Cannot send message while disconnected.");
			return;
		}
		if (!text) {
			return;
		}

		const payload: ChatSendEvent = {
			type: "send",
			body: text,
		};
		socket.send(JSON.stringify(payload));
	}, []);

	return {
		connectionStatus: status,
		realtimeMessages,
		presenceByUserId,
		sendRealtime,
		lastError,
		closeCode,
	};
}
