import type { ChatMessagePayload } from "../chat/types";

export interface ConversationThreadProps {
	contactName?: string;
	peerIsOnline?: boolean;
	peerIsTyping?: boolean;
	peerLastSeenAt?: string | null;
	hasActiveConversation?: boolean;
	onBackToList?: () => void;
	messages?: ChatMessagePayload[];
	currentUserId?: number;
	socketError?: string | null;
	composerValue: string;
	composerError?: string | null;
	isSending?: boolean;
	isHistoryLoading?: boolean;
	hasMoreHistory?: boolean;
	isLoadingMoreHistory?: boolean;
	isPrependingHistory?: boolean;
	onComposerChange: (value: string) => void;
	onComposerSubmit: () => void;
	onLoadOlderHistory?: () => Promise<void> | void;
}
