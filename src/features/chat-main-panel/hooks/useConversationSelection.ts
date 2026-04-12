import { useCallback, useState } from "react";
import type { Conversation } from "@/features/sidebar/types";

export interface ConversationSelectionState {
	selectedConversation: Conversation | null;
	handleSelectConversation: (conversation: Conversation) => void;
}

/** Tracks the currently selected conversation and selection handler. */
export function useConversationSelection(): ConversationSelectionState {
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);

	const handleSelectConversation = useCallback((conversation: Conversation) => {
		setSelectedConversation(conversation);
	}, []);

	return { selectedConversation, handleSelectConversation };
}
