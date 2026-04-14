import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useConversations } from "@/features/sidebar/hooks/useConversations";
import type { Conversation } from "@/features/sidebar/types";

export interface ConversationSelectionState {
	selectedConversation: Conversation | null;
	handleSelectConversation: (conversation: Conversation) => void;
	hasChatInRoute: boolean;
}

export function useConversationSelection(): ConversationSelectionState {
	const navigate = useNavigate();
	const { chatId } = useParams<{ chatId?: string }>();
	const { data: conversations = [] } = useConversations();

	const hasChatInRoute = Boolean(chatId);

	const selectedConversation = useMemo(() => {
		if (!hasChatInRoute) {
			return null;
		}

		const selectedConversationId = Number(chatId);
		if (!Number.isInteger(selectedConversationId) || selectedConversationId <= 0) {
			return null;
		}

		return conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
	}, [chatId, conversations, hasChatInRoute]);

	const handleSelectConversation = useCallback(
		(conversation: Conversation) => {
			navigate(`/chat/${conversation.id}`);
		},
		[navigate],
	);

	return { selectedConversation, handleSelectConversation, hasChatInRoute };
}
