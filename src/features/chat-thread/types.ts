import type { ChatMessagePayload, PresenceState, PresenceUser } from "../chat/types";
import type { Conversation } from "../sidebar/types";

export interface ConversationThreadProps {
	hasChatInRoute?: boolean;
	selectedConversation?: Conversation;
	peerData?: PresenceUser;
	presenceByUserId?: Record<number, PresenceState>;
	peerIsTyping?: boolean;
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
