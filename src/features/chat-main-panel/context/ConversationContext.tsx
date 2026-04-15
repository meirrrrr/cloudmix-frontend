import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { ChatMessagePayload, PresenceState } from "@/features/chat-messages/types";
import type { Conversation } from "../types";
import { useChatWebSocket } from "../hooks/useChatWebsockets";
import { useConversationHistory } from "../hooks/useConversationHistory";
import { useConversations } from "../hooks/useConversations";
import { mergeMessages } from "../lib/utils";

interface ConversationContextValue {
	selectedConversation: Conversation | null;
	isSelectedConversationLoading: boolean;
	hasChatInRoute: boolean;
	presenceByUserId: Record<number, PresenceState>;
	peerIsTyping: boolean;
	sendTyping: (isTyping: boolean) => void;
	messages: ChatMessagePayload[];
	chatError: string | null;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	isPrependingHistory: boolean;
	loadOlderHistory: () => Promise<void> | void;
	invalidateConversations: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useConversationContext(): ConversationContextValue {
	const ctx = useContext(ConversationContext);
	if (!ctx) throw new Error("useConversationContext must be used within ConversationProvider");
	return ctx;
}

export function ConversationProvider({ children }: { children: ReactNode }) {
	const { selectedConversation, isSelectedConversationLoading, hasChatInRoute, invalidateConversations } =
		useConversations();
	const conversationId = selectedConversation?.id ?? null;

	const {
		realtimeMessages,
		presenceByUserId,
		typingByUserId,
		sendTyping,
		lastError: websocketError,
	} = useChatWebSocket({ conversationId });

	const {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
	} = useConversationHistory({ selectedConversation });

	const messages = useMemo(
		() => (conversationId ? mergeMessages(historyMessages, realtimeMessages) : []),
		[conversationId, historyMessages, realtimeMessages],
	);

	const peerIsTyping = Boolean(conversationId && typingByUserId[selectedConversation?.peer.id ?? 0]);

	const value = useMemo<ConversationContextValue>(
		() => ({
			selectedConversation,
			isSelectedConversationLoading,
			hasChatInRoute,
			presenceByUserId,
			peerIsTyping,
			sendTyping,
			messages,
			chatError: historyError ?? websocketError,
			isHistoryLoading,
			hasMoreHistory,
			isLoadingMoreHistory,
			isPrependingHistory,
			loadOlderHistory,
			invalidateConversations,
		}),
		[
			selectedConversation,
			isSelectedConversationLoading,
			hasChatInRoute,
			presenceByUserId,
			peerIsTyping,
			sendTyping,
			messages,
			historyError,
			websocketError,
			isHistoryLoading,
			hasMoreHistory,
			isLoadingMoreHistory,
			isPrependingHistory,
			loadOlderHistory,
			invalidateConversations,
		],
	);

	return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}
