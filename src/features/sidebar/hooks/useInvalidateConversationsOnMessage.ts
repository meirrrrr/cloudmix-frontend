import { useEffect } from "react";

import type { Conversation } from "@/features/chat-main-panel/types";
import { toChatReceiveEvent } from "@/features/chat-main-panel/lib/chat-websocket/parseReceiveEvent";
import { toWsBaseUrl } from "@/features/chat-main-panel/lib/chat-websocket/ws-url";
import { env } from "@/shared/lib/env";
import { getAccessToken } from "@/shared/lib/jwt-storage";

interface UseInvalidateConversationsOnMessageOptions {
	conversations: Conversation[];
	refetch: () => void;
}

export function useInvalidateConversationsOnMessage({
	conversations,
	refetch,
}: UseInvalidateConversationsOnMessageOptions): void {
	const resolvedToken = (getAccessToken()?.trim() || "").trim();

	useEffect(() => {
		const conversationIds = conversations.map((conversation) => conversation.id);
		if (conversationIds.length === 0) {
			return;
		}

		let isUnmounted = false;
		const wsBase = toWsBaseUrl(env.apiBaseUrl);
		const tokenQuery = resolvedToken.length > 0 ? `?token=${encodeURIComponent(resolvedToken)}` : "";
		const sockets = conversationIds.map((id) => {
			const socket = new WebSocket(`${wsBase}/ws/chat/${id}/${tokenQuery}`);
			socket.onmessage = (rawMessage) => {
				if (isUnmounted) {
					return;
				}

				let parsed: unknown;
				try {
					parsed = JSON.parse(rawMessage.data);
				} catch {
					return;
				}

				const event = toChatReceiveEvent(parsed);
				if (event?.type === "message") {
					void refetch();
				}
			};
			return socket;
		});

		return () => {
			isUnmounted = true;
			for (const socket of sockets) {
				socket.close();
			}
		};
	}, [conversations, refetch, resolvedToken]);
}
