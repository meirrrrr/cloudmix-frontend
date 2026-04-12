import { apiRequest, ApiError } from "@/shared/lib/api-client";

import type {
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

const CHAT_BASE_PATH = "/api/chat";

export function getConversationMessages(
	conversationId: number,
): Promise<ConversationMessagesResponse> {
	return apiRequest<ConversationMessagesResponse>(
		`${CHAT_BASE_PATH}/conversations/${conversationId}/messages/`,
		{
			method: "GET",
		},
	);
}

export async function createMessage(
	conversationId: number,
	body: CreateMessageRequest["body"],
): Promise<CreateMessageResponse> {
	try {
		return await apiRequest<CreateMessageResponse>(
			`${CHAT_BASE_PATH}/conversations/${conversationId}/messages/`,
			{
				method: "POST",
				body: { body },
			},
		);
	} catch (error) {
		if (error instanceof ApiError) {
			throw new CreateMessageApiError(error.message, error.status, error.data);
		}
		throw error;
	}
}
