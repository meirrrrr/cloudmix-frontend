import type { ChatMessagePayload } from "../chat/types";

export interface ConversationThreadProps {
	contactName?: string;
	peerIsOnline?: boolean;
	peerLastSeenAt?: string | null;
	hasActiveConversation?: boolean;
	messages?: ChatMessagePayload[];
	currentUserId?: number;
	socketError?: string | null;
	composerValue: string;
	composerError?: string | null;
	isSending?: boolean;
	isHistoryLoading?: boolean;
	onComposerChange: (value: string) => void;
	onComposerSubmit: () => void;
}
