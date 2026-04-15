import type {
	ChatConnectionStatus,
	ChatErrorEvent,
	ChatMessagePayload,
	PresenceState,
} from "@/features/chat-messages/types";

export interface ChatState {
	status: ChatConnectionStatus;
	realtimeMessages: ChatMessagePayload[];
	presenceByUserId: Record<number, PresenceState>;
	typingByUserId: Record<number, boolean>;
	lastError: string | null;
	closeCode: number | null;
}

export type ChatAction =
	| { type: "reset" }
	| { type: "connect_start" }
	| { type: "open" }
	| { type: "socket_error"; error: string }
	| { type: "message"; message: ChatMessagePayload }
	| { type: "presence"; userId: number; state: PresenceState }
	| { type: "typing"; userId: number; isTyping: boolean }
	| { type: "chat_error"; error: string }
	| { type: "close"; code: number }
	| { type: "reconnecting"; code: number };

export const initialChatState: ChatState = {
	status: "idle",
	realtimeMessages: [],
	presenceByUserId: {},
	typingByUserId: {},
	lastError: null,
	closeCode: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
	switch (action.type) {
		case "reset":
			return initialChatState;
		case "connect_start":
			return { ...initialChatState, status: "connecting" };
		case "open":
			return { ...state, status: "open", closeCode: null, lastError: null };
		case "socket_error":
			return { ...state, status: "error", lastError: action.error };
		case "message":
			return {
				...state,
				realtimeMessages: [...state.realtimeMessages, action.message],
				typingByUserId: { ...state.typingByUserId, [action.message.sender.id]: false },
			};
		case "presence":
			return { ...state, presenceByUserId: { ...state.presenceByUserId, [action.userId]: action.state } };
		case "typing":
			return { ...state, typingByUserId: { ...state.typingByUserId, [action.userId]: action.isTyping } };
		case "chat_error":
			return { ...state, lastError: action.error };
		case "close":
			return { ...state, status: "closed", closeCode: action.code };
		case "reconnecting":
			return { ...state, status: "connecting", closeCode: action.code };
	}
}

export function toErrorMessage(event: ChatErrorEvent): string {
	if (event.detail) {
		return event.detail;
	}
	if (!event.errors) {
		return "Unknown chat error.";
	}
	return JSON.stringify(event.errors);
}
