import { apiRequest, ApiError } from "@/shared/lib/api-client";

import type {
	ConversationMessagesQuery,
	ConversationMessagesResponse,
	CreateMessageRequest,
	CreateMessageResponse,
} from "@/features/chat/types";

export class CreateMessageApiError extends Error {
	public readonly status: number;
	public readonly data: unknown;

	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = "CreateMessageApiError";
		this.status = status;
		this.data = data;
	}
}

export function getConversationMessages(
	conversationId: number,
	query: ConversationMessagesQuery = {},
): Promise<ConversationMessagesResponse> {
	const params: Record<string, string> = {};
	if (query.limit) params.limit = String(query.limit);
	if (query.before !== undefined) params.before = String(query.before);
	if (query.before_created_at) params.before_created_at = query.before_created_at;

	return apiRequest<ConversationMessagesResponse>(`/api/chat/conversations/${conversationId}/messages/`, {
		method: "GET",
		params,
	});
}

export async function createMessage(
	conversationId: number,
	body: CreateMessageRequest["body"],
): Promise<CreateMessageResponse> {
	try {
		return await apiRequest<CreateMessageResponse>(`/api/chat/conversations/${conversationId}/messages/`, {
			method: "POST",
			body: { body },
		});
	} catch (error) {
		if (error instanceof ApiError) {
			throw new CreateMessageApiError(error.message, error.status, error.data);
		}
		throw error;
	}
}
