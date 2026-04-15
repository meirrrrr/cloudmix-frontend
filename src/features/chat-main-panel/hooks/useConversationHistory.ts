import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ChatMessagePayload } from "@/features/chat-messages/types";
import { markConversationRead } from "@/features/chat-main-panel/api/conversations-api";
import { ApiError } from "@/shared/lib/api-client";
import { useConversationHistoryQuery } from "@/features/chat-main-panel/api/useConversationHistoryQuery";
import {
	CONVERSATION_HISTORY_QUERY_KEY,
	CONVERSATION_QUERY_KEY,
	CONVERSATIONS_QUERY_KEY,
} from "@/shared/lib/constants";
import type { Conversation } from "../types";
import { mergeMessages } from "../lib/utils";
import type { ConversationHistoryState, UseConversationHistoryOptions } from "../types";

export function useConversationHistory({
	selectedConversation,
}: UseConversationHistoryOptions): ConversationHistoryState {
	const queryClient = useQueryClient();
	const selectedConversationId = selectedConversation?.id ?? null;
	const selectedConversationUnreadCount = selectedConversation?.unread_count ?? 0;
	const [isPrependingHistory, setIsPrependingHistory] = useState(false);
	const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

	const {
		data,
		error: historyQueryError,
		isLoading: isHistoryLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useConversationHistoryQuery(selectedConversationId);

	const markReadMutation = useMutation({
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

	const refreshHistory = useCallback(
		async (conversationId: number) => {
			setLoadMoreError(null);
			await queryClient.invalidateQueries({
				queryKey: CONVERSATION_HISTORY_QUERY_KEY(conversationId),
			});
		},
		[queryClient],
	);

	const loadOlderHistory = useCallback(async () => {
		if (!selectedConversationId || !hasNextPage || isFetchingNextPage) {
			return;
		}

		setIsPrependingHistory(true);
		setLoadMoreError(null);
		try {
			await fetchNextPage();
		} catch {
			setLoadMoreError("Unable to load older messages.");
		} finally {
			requestAnimationFrame(() => setIsPrependingHistory(false));
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, selectedConversationId]);

	const historyMessages = useMemo(
		() =>
			data?.pages.reduce((messages, page) => {
				return mergeMessages(page.results, messages);
			}, [] as ChatMessagePayload[]) ?? [],
		[data],
	);

	const historyError = useMemo(() => {
		if (loadMoreError) {
			return loadMoreError;
		}
		if (!historyQueryError) {
			return null;
		}
		if (historyQueryError instanceof ApiError) {
			return historyQueryError.message;
		}
		return "Unable to load messages.";
	}, [historyQueryError, loadMoreError]);

	useEffect(() => {
		if (!selectedConversationId) {
			setIsPrependingHistory(false);
			setLoadMoreError(null);
		}
	}, [selectedConversationId]);

	useEffect(() => {
		if (!selectedConversationId || selectedConversationUnreadCount <= 0 || markReadMutation.isPending) {
			return;
		}

		markReadMutation.mutate(selectedConversationId);
	}, [markReadMutation, selectedConversationId, selectedConversationUnreadCount]);

	return {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory: Boolean(hasNextPage),
		isLoadingMoreHistory: isFetchingNextPage,
		isPrependingHistory,
		loadOlderHistory,
		refreshHistory,
	};
}
