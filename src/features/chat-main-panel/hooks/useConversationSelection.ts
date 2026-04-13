import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConversations } from "@/features/sidebar/hooks/useConversations";
import type { Conversation } from "@/features/sidebar/types";

export interface ConversationSelectionState {
	selectedConversation: Conversation | null;
	handleSelectConversation: (conversation: Conversation) => void;
	chatId: string | null;
}

export function useConversationSelection(): ConversationSelectionState {
	const navigate = useNavigate();
	const { chatId } = useParams<{ chatId?: string }>();
	const { data: conversations = [] } = useConversations();

	const selectedConversation = useMemo(() => {
		if (!chatId) {
			return null;
		}

		const selectedConversationId = Number(chatId);
		if (!Number.isInteger(selectedConversationId) || selectedConversationId <= 0) {
			return null;
		}

		return conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
	}, [chatId, conversations]);

	const handleSelectConversation = useCallback(
		(conversation: Conversation) => {
			navigate(`/chat/${conversation.id}`);
		},
		[navigate],
	);

	return { selectedConversation, handleSelectConversation, chatId };
}
