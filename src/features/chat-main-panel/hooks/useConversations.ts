import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useConversationQuery } from "@/features/chat-main-panel/api/useConversationsQuery";
import type { Conversation } from "@/features/chat-main-panel/types";
import { CONVERSATIONS_QUERY_KEY } from "@/shared/lib/constants";

export interface ConversationSelectionState {
	selectedConversation: Conversation | null;
	isSelectedConversationLoading: boolean;
	hasChatInRoute: boolean;
	invalidateConversations: () => void;
}

export function useConversations(): ConversationSelectionState {
	const queryClient = useQueryClient();
	const { chatId } = useParams<{ chatId?: string }>();

	const hasChatInRoute = Boolean(chatId);

	const parsedChatId = (() => {
		const id = Number(chatId);
		return Number.isInteger(id) && id > 0 ? id : null;
	})();

	const { data: selectedConversation = null, isLoading: isSelectedConversationLoading } =
		useConversationQuery(parsedChatId);

	const invalidateConversations = useCallback(() => {
		void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
		void queryClient.invalidateQueries({ queryKey: ["conversation"] });
	}, [queryClient]);

	return {
		selectedConversation,
		isSelectedConversationLoading,
		hasChatInRoute,
		invalidateConversations,
	};
}
