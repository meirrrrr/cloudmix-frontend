import type { ChatConnectionStatus, ChatMessagePayload, PresenceState } from "@/features/chat-messages/types";

export interface UseChatWebSocketOptions {
	conversationId?: number | null;
	accessToken?: string;
}

export interface UseChatWebSocketResult {
	connectionStatus: ChatConnectionStatus;
	realtimeMessages: ChatMessagePayload[];
	presenceByUserId: Record<number, PresenceState>;
	typingByUserId: Record<number, boolean>;
	sendTyping: (isTyping: boolean) => void;
	lastError: string | null;
	closeCode: number | null;
}

export type Conversation = {
	id: number;
	updated_at: string;
	unread_count: number;
	is_ai_assistant: boolean;
	last_message: {
		id: number;
		body: string;
		created_at: string;
		sender: {
			id: number;
			username: string;
			display_name: string;
			is_online: boolean;
			last_seen_at: string | null;
		};
	} | null;
	peer: {
		id: number;
		username: string;
		display_name: string;
		is_online: boolean;
		last_seen_at: string | null;
	};
};

export interface ConversationHistoryState {
	historyMessages: ChatMessagePayload[];
	historyError: string | null;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	isPrependingHistory: boolean;
	loadOlderHistory: () => Promise<void>;
	refreshHistory: (conversationId: number) => Promise<void>;
}

export interface UseConversationHistoryOptions {
	selectedConversation: Conversation | null;
}
