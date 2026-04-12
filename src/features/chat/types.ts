export interface ConversationPreview {
	id: string;
	name: string;
	lastMessage: string;
	time: string;
	unreadCount?: number;
}

export interface PresenceUser {
	id: number;
	username: string;
	display_name: string;
	is_online: boolean;
	last_seen_at: string | null;
}

export interface PresenceState {
	is_online: boolean;
	last_seen_at: string | null;
}

export type ChatConnectionStatus =
	| "idle"
	| "connecting"
	| "open"
	| "closed"
	| "error";

export interface ChatSendEvent {
	type: "send";
	body: string;
}

export interface ChatMessagePayload {
	id: number;
	body: string;
	created_at: string;
	sender: PresenceUser;
}

export interface CreateMessageRequest {
	body: string;
}

export type CreateMessageResponse = ChatMessagePayload;

export interface ConversationMessagesResponse {
	results: ChatMessagePayload[];
	has_more: boolean;
}

export interface ChatMessageEvent {
	type: "message";
	message: ChatMessagePayload;
}

export interface ChatPresenceEvent {
	type: "presence";
	user_id: number;
	is_online: boolean;
	last_seen_at: string | null;
}

export interface ChatErrorEvent {
	type: "error";
	errors?: Record<string, string[] | string>;
	detail?: string;
}

export type ChatReceiveEvent =
	| ChatMessageEvent
	| ChatPresenceEvent
	| ChatErrorEvent;

export interface ChatMessage {
	date: string;
	id: string;
	text: string;
	direction: "incoming" | "outgoing";
}
