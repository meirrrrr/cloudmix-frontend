import type { ChatMessagePayload, PresenceState, PresenceUser } from "../chat/types";
import type { ComposerSendStatus } from "../chat-main-panel/hooks/useMessageComposer";
import type { Conversation } from "../sidebar/types";

export interface ConversationThreadProps {
	hasChatInRoute?: boolean;
	selectedConversation?: Conversation;
	peerData?: PresenceUser;
	presenceByUserId?: Record<number, PresenceState>;
	peerIsTyping?: boolean;
	messages?: ChatMessagePayload[];
	chatError?: string | null;
	composerValue: string;
	composerError?: string | null;
	isSending?: boolean;
	isHistoryLoading?: boolean;
	hasMoreHistory?: boolean;
	isLoadingMoreHistory?: boolean;
	isPrependingHistory?: boolean;
	sendStatus?: ComposerSendStatus;
	onComposerChange: (value: string) => void;
	onComposerSubmit: () => void;
	onLoadOlderHistory?: () => Promise<void> | void;
}
