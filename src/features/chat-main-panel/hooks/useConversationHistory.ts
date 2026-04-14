import { useCallback, useEffect, useState } from "react";
import { getConversationMessages } from "@/features/chat-messages/api/messages-api";
import type { ChatMessagePayload, ConversationMessagesResponse } from "@/features/chat/types";
import { markConversationRead } from "@/features/sidebar/api/conversations-api";
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
	const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
	const [nextBeforeCreatedAt, setNextBeforeCreatedAt] = useState<string | null>(null);
	const [isPrependingHistory, setIsPrependingHistory] = useState(false);

	const loadInitialHistory = useCallback(async (conversationId: number) => {
		setHistoryError(null);
		const response = await loadConversationHistory(conversationId);
		setHistoryMessages(sortMessages(response.results));
		setHasMoreHistory(response.has_more);
		setNextBeforeId(response.next_before);
		setNextBeforeCreatedAt(response.next_before_created_at);
	}, []);

	const refreshHistory = useCallback(
		async (conversationId: number) => {
			await loadInitialHistory(conversationId);
		},
		[loadInitialHistory],
	);

	const loadOlderHistory = useCallback(async () => {
		if (
			!selectedConversationId ||
			!hasMoreHistory ||
			(!nextBeforeId && !nextBeforeCreatedAt) ||
			isLoadingMoreHistory
		) {
			return;
		}

		setIsLoadingMoreHistory(true);
		setIsPrependingHistory(true);
		setHistoryError(null);
		try {
			const response = await getConversationMessages(selectedConversationId, {
				limit: INITIAL_HISTORY_LIMIT,
				...(nextBeforeId !== null && { before: nextBeforeId }),
				...(nextBeforeCreatedAt !== null && { before_created_at: nextBeforeCreatedAt }),
			});
			setHistoryMessages((current) => mergeMessages(response.results, current));
			setHasMoreHistory(response.has_more);
			setNextBeforeId(response.next_before);
			setNextBeforeCreatedAt(response.next_before_created_at);
		} catch {
			setHistoryError("Unable to load older messages.");
		} finally {
			setIsLoadingMoreHistory(false);
			// Defer so the prepended messages render first with isPrependingHistory=true,
			// preventing the auto-scroll from jumping to the bottom.
			requestAnimationFrame(() => setIsPrependingHistory(false));
		}
	}, [hasMoreHistory, isLoadingMoreHistory, nextBeforeCreatedAt, nextBeforeId, selectedConversationId]);

	useEffect(() => {
		if (!selectedConversationId) {
			setHistoryMessages([]);
			setHistoryError(null);
			setIsHistoryLoading(false);
			setHasMoreHistory(false);
			setIsLoadingMoreHistory(false);
			setNextBeforeId(null);
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

		return () => {
			isCancelled = true;
		};
	}, [loadInitialHistory, selectedConversationId]);

	useEffect(() => {
		if (!selectedConversationId || selectedConversationUnreadCount <= 0) {
			return;
		}

		void markConversationReadOnce(selectedConversationId)
			.then(onConversationRead)
			.catch(() => {
				// Ignore read marker errors because chat should stay usable.
			});
	}, [onConversationRead, selectedConversationId, selectedConversationUnreadCount]);

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
