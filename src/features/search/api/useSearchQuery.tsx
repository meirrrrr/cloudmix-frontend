import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import { createConversation, searchUsers } from "@/features/search/api/search-api";
import type { ConversationResponse, SearchUser } from "../types";
import { CONVERSATIONS_QUERY_KEY } from "@/shared/lib/constants";

export function useSearchQuery(name: string): UseQueryResult<SearchUser[]> {
	const normalizedName = name.trim();

	return useQuery({
		queryKey: ["name", normalizedName],
		queryFn: () => searchUsers(normalizedName),
		retry: false,
		enabled: normalizedName.length > 0,
	});
}

export function useCreateConversationMutation(): UseMutationResult<ConversationResponse, Error, number> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => createConversation(userId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: CONVERSATIONS_QUERY_KEY,
			});
		},
	});
}
