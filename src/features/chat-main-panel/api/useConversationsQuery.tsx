import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getConversationById, getConversations } from "@/features/chat-main-panel/api/conversations-api";
import type { Conversation } from "@/features/chat-main-panel/types";
import { CONVERSATIONS_QUERY_KEY, CONVERSATION_QUERY_KEY } from "@/shared/lib/constants";

export function useConversationQuery(conversationId: number | null): UseQueryResult<Conversation> {
	const id = conversationId ?? 0;

	return useQuery({
		queryKey: CONVERSATION_QUERY_KEY(id),
		queryFn: () => getConversationById(id),
		enabled: id > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
}

export function useConversationsQuery(): UseQueryResult<Conversation[]> {
	return useQuery({
		queryKey: CONVERSATIONS_QUERY_KEY,
		queryFn: () => getConversations(),
		retry: false,
	});
}
