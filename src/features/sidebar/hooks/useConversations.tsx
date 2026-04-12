import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getConversations } from "../api/conversations";
import type { Conversation } from "../types";

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;

export function useConversations(): UseQueryResult<Conversation[]> {
	return useQuery({
		queryKey: CONVERSATIONS_QUERY_KEY,
		queryFn: getConversations,
	});
}
