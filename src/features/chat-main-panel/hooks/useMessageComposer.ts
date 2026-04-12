import { useCallback, useEffect, useState } from "react";
import { createMessage } from "@/features/chat/api/messages";
import type { ChatMessagePayload, PresenceUser } from "@/features/chat/types";
import type { Conversation } from "@/features/sidebar/types";
import {
	CHAT_MESSAGE_MAX_LENGTH,
	createOptimisticMessage,
	mergeMessages,
	toComposerErrorMessage,
} from "../lib/chat-main-panel-utils";

export interface MessageComposerState {
	savedMessages: ChatMessagePayload[];
	draftMessage: string;
	composerError: string | null;
	isSending: boolean;
	handleComposerChange: (value: string) => void;
	handleComposerSubmit: () => Promise<void>;
}

interface UseMessageComposerOptions {
	selectedConversation: Conversation | null;
	currentUser: PresenceUser | null;
	onMessageCreated: () => Promise<unknown>;
	refreshHistory: (conversationId: number) => Promise<void>;
}

/** Manages draft input, optimistic sends, and error handling for the composer. */
export function useMessageComposer({
	selectedConversation,
	currentUser,
	onMessageCreated,
	refreshHistory,
}: UseMessageComposerOptions): MessageComposerState {
	const [savedMessages, setSavedMessages] = useState<ChatMessagePayload[]>([]);
	const [draftMessage, setDraftMessage] = useState("");
	const [composerError, setComposerError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		setSavedMessages([]);
		setDraftMessage("");
		setComposerError(null);
		setIsSending(false);
	}, [selectedConversation?.id]);

	const handleComposerChange = useCallback((value: string) => {
		setDraftMessage(value);
		setComposerError((currentError) => (currentError ? null : currentError));
	}, []);

	const handleComposerSubmit = useCallback(async () => {
		if (!selectedConversation || isSending) {
			return;
		}

		const trimmedBody = draftMessage.trim();
		if (!trimmedBody) {
			setComposerError("Message cannot be empty.");
			return;
		}
		if (trimmedBody.length > CHAT_MESSAGE_MAX_LENGTH) {
			setComposerError(`Message cannot exceed ${CHAT_MESSAGE_MAX_LENGTH} characters.`);
			return;
		}

		setComposerError(null);
		setIsSending(true);

		const conversationId = selectedConversation.id;
		const optimisticMessageId = -Date.now();
		const optimisticMessage = createOptimisticMessage(optimisticMessageId, trimmedBody, currentUser);
		setSavedMessages((currentMessages) => mergeMessages(currentMessages, [optimisticMessage]));
		setDraftMessage("");

		try {
			const createdMessage = await createMessage(conversationId, trimmedBody);
			setSavedMessages((currentMessages) => {
				const withoutOptimistic = currentMessages.filter((message) => message.id !== optimisticMessageId);
				return mergeMessages(withoutOptimistic, [createdMessage]);
			});
			void onMessageCreated();
			void refreshHistory(conversationId).catch(() => {
				// Keep optimistic/server-created local state if refresh fails.
			});
		} catch (error) {
			setSavedMessages((currentMessages) =>
				currentMessages.filter((message) => message.id !== optimisticMessageId),
			);
			setDraftMessage(trimmedBody);
			setComposerError(toComposerErrorMessage(error));
		} finally {
			setIsSending(false);
		}
	}, [currentUser, draftMessage, isSending, onMessageCreated, refreshHistory, selectedConversation]);

	return {
		savedMessages,
		draftMessage,
		composerError,
		isSending,
		handleComposerChange,
		handleComposerSubmit,
	};
}
