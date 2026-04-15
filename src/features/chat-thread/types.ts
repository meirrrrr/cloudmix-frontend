import type { ChatMessagePayload } from "@/features/chat-messages/types";

export interface ThreadDividerItem {
	type: "divider";
	key: string;
	label: string;
}

export interface ThreadMessageItem {
	type: "message";
	message: ChatMessagePayload;
}

export interface ChatMessage {
	date: string;
	id: string;
	text: string;
	direction: "incoming" | "outgoing";
}

export interface ConversationPreview {
	id: string;
	name: string;
	lastMessage: string;
	time: string;
	unreadCount?: number;
}
