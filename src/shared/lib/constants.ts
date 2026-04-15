export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;
export const CONVERSATION_QUERY_KEY = (conversationId: number) => ["conversation", conversationId] as const;
export const CONVERSATION_HISTORY_QUERY_KEY = (conversationId: number) =>
	["conversation-history", conversationId] as const;
