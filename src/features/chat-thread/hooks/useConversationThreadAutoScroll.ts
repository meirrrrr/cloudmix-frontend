import { useEffect, useRef } from "react";

interface UseConversationThreadAutoScrollParams {
	messagesCount: number;
	isHistoryLoading: boolean;
}

/**
 * Scrolls the thread container to the latest message after updates.
 */
export function useConversationThreadAutoScroll({
	messagesCount,
	isHistoryLoading,
}: UseConversationThreadAutoScrollParams) {
	const messageListRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (isHistoryLoading) {
			return;
		}

		const listNode = messageListRef.current;
		if (!listNode) {
			return;
		}

		listNode.scrollTo({
			top: listNode.scrollHeight,
			behavior: "smooth",
		});
	}, [messagesCount, isHistoryLoading]);

	return messageListRef;
}
