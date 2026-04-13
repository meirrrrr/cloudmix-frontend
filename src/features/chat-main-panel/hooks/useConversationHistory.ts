import { useCallback, useEffect, useState } from "react";
import { getConversationMessages } from "@/features/chat/api/messages";
import type { ChatMessagePayload, ConversationMessagesResponse } from "@/features/chat/types";
import { markConversationRead } from "@/features/sidebar/api/conversations";
import type { Conversation } from "@/features/sidebar/types";
import { ApiError } from "@/shared/lib/api-client";
import { mergeMessages, sortMessages } from "../lib/chat-main-panel-utils";

const INITIAL_HISTORY_LIMIT = 30;

const historyRequestByConversation = new Map<number, Promise<ConversationMessagesResponse>>();
const markReadRequestByConversation = new Map<number, Promise<void>>();

function loadConversationHistory(conversationId: number): Promise<ConversationMessagesResponse> {
	const existingRequest = historyRequestByConversation.get(conversationId);
	if (existingRequest) {
		return existingRequest;
	}

	const request = getConversationMessages(conversationId, { limit: INITIAL_HISTORY_LIMIT }).finally(() => {
		historyRequestByConversation.delete(conversationId);
	});
	historyRequestByConversation.set(conversationId, request);
	return request;
}

function markConversationReadOnce(conversationId: number): Promise<void> {
	const existingRequest = markReadRequestByConversation.get(conversationId);
	if (existingRequest) {
		return existingRequest;
	}

	const request = markConversationRead(conversationId).finally(() => {
		markReadRequestByConversation.delete(conversationId);
	});
	markReadRequestByConversation.set(conversationId, request);
	return request;
}

export interface ConversationHistoryState {
	historyMessages: ChatMessagePayload[];
	historyError: string | null;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	isPrependingHistory: boolean;
	loadOlderHistory: () => Promise<void>;
	refreshHistory: (conversationId: number) => Promise<void>;
}

interface UseConversationHistoryOptions {
	selectedConversation: Conversation | null;
	onConversationRead: () => Promise<unknown>;
}

/** Loads, refreshes, and tracks message history for the selected conversation. */
export function useConversationHistory({
	selectedConversation,
	onConversationRead,
}: UseConversationHistoryOptions): ConversationHistoryState {
	const selectedConversationId = selectedConversation?.id ?? null;
	const selectedConversationUnreadCount = selectedConversation?.unread_count ?? 0;

	const [historyMessages, setHistoryMessages] = useState<ChatMessagePayload[]>([]);
	const [historyError, setHistoryError] = useState<string | null>(null);
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
	const [hasMoreHistory, setHasMoreHistory] = useState(false);
	const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);
	const [nextBeforeCreatedAt, setNextBeforeCreatedAt] = useState<string | null>(null);
	const [isPrependingHistory, setIsPrependingHistory] = useState(false);

	const loadInitialHistory = useCallback(async (conversationId: number) => {
		setHistoryError(null);
		const response = await loadConversationHistory(conversationId);
		setHistoryMessages(sortMessages(response.results));
		setHasMoreHistory(response.has_more);
		setNextBeforeCreatedAt(response.next_before_created_at);
	}, []);

	const refreshHistory = useCallback(
		async (conversationId: number) => {
			await loadInitialHistory(conversationId);
		},
		[loadInitialHistory],
	);

	const loadOlderHistory = useCallback(async () => {
		if (!selectedConversationId || !hasMoreHistory || !nextBeforeCreatedAt || isLoadingMoreHistory) {
			return;
		}

		setIsLoadingMoreHistory(true);
		setIsPrependingHistory(true);
		setHistoryError(null);
		try {
			const response = await getConversationMessages(selectedConversationId, {
				limit: INITIAL_HISTORY_LIMIT,
				before_created_at: nextBeforeCreatedAt,
			});
			setHistoryMessages((current) => mergeMessages(response.results, current));
			setHasMoreHistory(response.has_more);
			setNextBeforeCreatedAt(response.next_before_created_at);
		} catch {
			setHistoryError("Unable to load older messages.");
		} finally {
			setIsLoadingMoreHistory(false);
			setIsPrependingHistory(false);
		}
	}, [hasMoreHistory, isLoadingMoreHistory, nextBeforeCreatedAt, selectedConversationId]);

	useEffect(() => {
		if (!selectedConversationId) {
			setHistoryMessages([]);
			setHistoryError(null);
			setIsHistoryLoading(false);
			setHasMoreHistory(false);
			setIsLoadingMoreHistory(false);
			setNextBeforeCreatedAt(null);
			setIsPrependingHistory(false);
			return;
		}

		let isCancelled = false;
		setHistoryMessages([]);
		setHistoryError(null);
		setIsHistoryLoading(true);

		const conversationId = selectedConversationId;

		void loadInitialHistory(conversationId)
			.catch((error: unknown) => {
				if (isCancelled) {
					return;
				}
				if (error instanceof ApiError) {
					setHistoryError(error.message);
					return;
				}
				setHistoryError("Unable to load messages.");
			})
			.finally(() => {
				if (isCancelled) {
					return;
				}
				setIsHistoryLoading(false);
			});

		if (selectedConversationUnreadCount > 0) {
			void markConversationReadOnce(conversationId)
				.then(onConversationRead)
				.catch(() => {
					// Ignore read marker errors because chat should stay usable.
				});
		}

		return () => {
			isCancelled = true;
		};
	}, [loadInitialHistory, onConversationRead, selectedConversationId, selectedConversationUnreadCount]);

	return {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
		refreshHistory,
	};
}
