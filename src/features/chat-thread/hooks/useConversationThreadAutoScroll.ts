import { useEffect, useRef } from "react";

interface UseConversationThreadAutoScrollParams {
	messagesCount: number;
	isHistoryLoading: boolean;
	isPrependingHistory: boolean;
}

/**
 * Scrolls the thread container to the latest message after updates.
 */
export function useConversationThreadAutoScroll({
	messagesCount,
	isHistoryLoading,
	isPrependingHistory,
}: UseConversationThreadAutoScrollParams) {
	const messageListRef = useRef<HTMLDivElement | null>(null);
	const previousMessagesCountRef = useRef(0);

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
