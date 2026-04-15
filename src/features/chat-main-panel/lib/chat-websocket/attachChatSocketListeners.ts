import type { Dispatch, MutableRefObject } from "react";

import { markConversationRead } from "@/features/chat-main-panel/api/conversations-api";

import type { ChatAction } from "./chatReducer";
import { toErrorMessage } from "./chatReducer";
import { toChatReceiveEvent } from "./parseReceiveEvent";

export interface AttachChatSocketListenersParams {
	isCancelled: () => boolean;
	dispatch: Dispatch<ChatAction>;
	conversationId: number;
	cleanToken: string;
	useToken: boolean;
	hasRetriedWithTokenRef: MutableRefObject<boolean>;
	reconnectWithToken: () => void;
}

export function attachChatSocketListeners(socket: WebSocket, params: AttachChatSocketListenersParams): void {
	const { isCancelled, dispatch, conversationId, cleanToken, useToken, hasRetriedWithTokenRef, reconnectWithToken } =
		params;

	socket.onopen = () => {
		if (isCancelled()) {
			return;
		}
		dispatch({ type: "open" });
	};

	socket.onerror = () => {
		if (isCancelled()) {
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
			markConversationRead(conversationId);
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
		if (isCancelled()) {
			return;
		}

		if (event.code === 4401 && cleanToken && !useToken && !hasRetriedWithTokenRef.current) {
			hasRetriedWithTokenRef.current = true;
			dispatch({ type: "reconnecting", code: event.code });
			reconnectWithToken();
			return;
		}

		dispatch({ type: "close", code: event.code });
	};
}
