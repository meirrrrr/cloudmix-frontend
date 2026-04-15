import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversationMessages } from "@/features/chat-messages/api/messages-api";
import { CONVERSATION_HISTORY_QUERY_KEY } from "@/shared/lib/constants";

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
		retry: false,
	});
}
