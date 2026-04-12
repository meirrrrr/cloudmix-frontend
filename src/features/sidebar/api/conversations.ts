import { apiRequest } from "@/shared/lib/api-client";
import type { Conversation } from "../types";

export function getConversations() {
	return apiRequest<Conversation[]>("/api/chat/conversations/", {
		method: "GET",
	});
}

export function markConversationRead(conversationId: number): Promise<null> {
	return apiRequest<null>(`/api/chat/conversations/${conversationId}/read/`, {
		method: "POST",
	});
}
