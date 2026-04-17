import { useEffect, useRef } from "react";

interface UseConversationThreadAutoScrollParams {
	conversationId: number;
	messagesCount: number;
	isHistoryLoading: boolean;
	isPrependingHistory: boolean;
}

export function useConversationThreadAutoScroll({
	conversationId,
	messagesCount,
	isHistoryLoading,
	isPrependingHistory,
}: UseConversationThreadAutoScrollParams) {
	const messageListRef = useRef<HTMLDivElement | null>(null);
	const previousMessagesCountRef = useRef(0);

	useEffect(() => {
		previousMessagesCountRef.current = 0;
	}, [conversationId]);

	useEffect(() => {
		if (isHistoryLoading) {
			return;
		}

		const listNode = messageListRef.current;
		if (!listNode) {
			return;
		}

		const previousCount = previousMessagesCountRef.current;
		const hasInitialLoad = previousCount === 0 && messagesCount > 0;
		const hasNewMessageAppended = messagesCount > previousCount;
		const shouldAutoScroll = hasInitialLoad || (hasNewMessageAppended && !isPrependingHistory);

		previousMessagesCountRef.current = messagesCount;

		if (!shouldAutoScroll) {
			return;
		}

		listNode.scrollTo({
			top: listNode.scrollHeight,
			behavior: "smooth",
		});
	}, [isHistoryLoading, isPrependingHistory, messagesCount]);

	return messageListRef;
}
