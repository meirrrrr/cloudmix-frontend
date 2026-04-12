import { useMemo } from "react";
import type { ChatMessagePayload } from "../../chat/types";

export interface MessageVisibilityMap {
	[id: number]: boolean;
}

interface UseConversationThreadMessageVisibilityParams {
	messages: ChatMessagePayload[];
	contactName?: string;
	isHistoryLoading: boolean;
}

/**
 * Returns visibility flags used by message bubbles for entrance transitions.
 */
export function useConversationThreadMessageVisibility({
	messages,
	contactName: _contactName,
	isHistoryLoading: _isHistoryLoading,
}: UseConversationThreadMessageVisibilityParams): MessageVisibilityMap {
	return useMemo(() => {
		return messages.reduce<MessageVisibilityMap>((result, message) => {
			result[message.id] = true;
			return result;
		}, {});
	}, [messages]);
}
