import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { markConversationRead } from "@/features/chat-main-panel/api/conversations-api";
import type { Conversation } from "@/features/chat-main-panel/types";
import { getConversationMessages } from "@/features/chat-messages/api/messages-api";
import { CONVERSATION_HISTORY_QUERY_KEY, CONVERSATION_QUERY_KEY, CONVERSATIONS_QUERY_KEY } from "@/shared/lib/constants";

export const INITIAL_HISTORY_LIMIT = 30;

interface HistoryPageParam {
	before?: number;
	before_created_at?: string;
}

export function useConversationHistoryQuery(conversationId: number | null) {
	return useInfiniteQuery({
		queryKey: CONVERSATION_HISTORY_QUERY_KEY(conversationId ?? 0),
		enabled: Boolean(conversationId),
		initialPageParam: {} as HistoryPageParam,
		queryFn: ({ pageParam }) =>
			getConversationMessages(conversationId ?? 0, {
				limit: INITIAL_HISTORY_LIMIT,
				...(pageParam.before !== undefined && { before: pageParam.before }),
				...(pageParam.before_created_at && { before_created_at: pageParam.before_created_at }),
			}),
		getNextPageParam: (lastPage): HistoryPageParam | undefined => {
			if (!lastPage.has_more) {
				return undefined;
			}

			if (lastPage.next_before !== null) {
				return { before: lastPage.next_before };
			}

			if (lastPage.next_before_created_at !== null) {
				return { before_created_at: lastPage.next_before_created_at };
			}

			return undefined;
		},
		refetchOnWindowFocus: false,
		retry: false,
	});
}

export function useMarkConversationReadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (conversationId: number) => markConversationRead(conversationId),
		onSuccess: (_data, conversationId) => {
			queryClient.setQueryData<Conversation | undefined>(
				CONVERSATION_QUERY_KEY(conversationId),
				(conversation) => (conversation ? { ...conversation, unread_count: 0 } : conversation),
			);
			queryClient.setQueryData<Conversation[] | undefined>(CONVERSATIONS_QUERY_KEY, (conversations) =>
				conversations?.map((conversation) =>
					conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation,
				),
			);
		},
	});
}
