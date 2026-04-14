import { apiRequest } from "@/shared/lib/api-client";
import type { SearchUser, ConversationResponse } from "../types";

export function searchUsers(name: string): Promise<SearchUser[]> {
	return apiRequest<SearchUser[]>(`/api/accounts/users/search/`, {
		method: "GET",
		params: {
			name: name.trim(),
		},
	});
}

export function createConversation(userId: number): Promise<ConversationResponse> {
	return apiRequest<ConversationResponse>(`/api/chat/conversations/start/`, {
		method: "POST",
		body: {
			user_id: userId,
		},
	});
}
