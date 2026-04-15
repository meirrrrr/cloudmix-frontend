import { useCallback, useEffect, useReducer, useRef } from "react";

import type { ChatOutgoingEvent } from "@/features/chat-messages/types";
import { env } from "@/shared/lib/env";

import type { UseChatWebSocketOptions, UseChatWebSocketResult } from "../types";
import { attachChatSocketListeners } from "../lib/chat-websocket/attachChatSocketListeners";
import { chatReducer, initialChatState } from "../lib/chat-websocket/chatReducer";
import { toWsBaseUrl } from "../lib/chat-websocket/ws-url";

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

			attachChatSocketListeners(socket, {
				isCancelled: () => isCancelled,
				dispatch,
				conversationId,
				cleanToken,
				useToken,
				hasRetriedWithTokenRef,
				reconnectWithToken: () => connect(true),
			});
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
