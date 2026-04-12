import { useCallback, useEffect, useState } from "react";
import { getConversationMessages } from "@/features/chat/api/messages";
import type { ChatMessagePayload } from "@/features/chat/types";
import { markConversationRead } from "@/features/sidebar/api/conversations";
import type { Conversation } from "@/features/sidebar/types";
import { ApiError } from "@/shared/lib/api-client";
import { sortMessages } from "../lib/chat-main-panel-utils";

export interface ConversationHistoryState {
	historyMessages: ChatMessagePayload[];
	historyError: string | null;
	isHistoryLoading: boolean;
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
	const [historyMessages, setHistoryMessages] = useState<ChatMessagePayload[]>([]);
	const [historyError, setHistoryError] = useState<string | null>(null);
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);

	const refreshHistory = useCallback(async (conversationId: number) => {
		const response = await getConversationMessages(conversationId);
		setHistoryMessages(sortMessages(response.results));
	}, []);

	useEffect(() => {
		if (!selectedConversation) {
			setHistoryMessages([]);
			setHistoryError(null);
			setIsHistoryLoading(false);
			return;
		}

		let isCancelled = false;
		setHistoryMessages([]);
		setHistoryError(null);
		setIsHistoryLoading(true);

		const conversationId = selectedConversation.id;

		void getConversationMessages(conversationId)
			.then((response) => {
				if (isCancelled) {
					return;
				}
				setHistoryMessages(sortMessages(response.results));
			})
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

		void markConversationRead(conversationId)
			.then(onConversationRead)
			.catch(() => {
				// Ignore read marker errors because chat should stay usable.
			});

		return () => {
			isCancelled = true;
		};
	}, [onConversationRead, selectedConversation]);

	return { historyMessages, historyError, isHistoryLoading, refreshHistory };
}
