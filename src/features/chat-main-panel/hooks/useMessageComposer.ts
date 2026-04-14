import { useCallback, useEffect, useRef, useState } from "react";
import { createMessage } from "@/features/chat/api/messages";
import type { Conversation } from "@/features/sidebar/types";
import { CHAT_MESSAGE_MAX_LENGTH, toComposerErrorMessage } from "../lib/chat-main-panel-utils";

export type ComposerSendPhase = "idle" | "sending" | "sent" | "failed";

export interface ComposerSendStatus {
	phase: ComposerSendPhase;
	messageId: number | null;
}

export interface MessageComposerState {
	draftMessage: string;
	composerError: string | null;
	isSending: boolean;
	sendStatus: ComposerSendStatus;
	handleComposerChange: (value: string) => void;
	handleComposerSubmit: () => Promise<void>;
}

interface UseMessageComposerOptions {
	selectedConversation: Conversation | null;
	onMessageCreated: () => Promise<unknown>;
}

const SENT_STATUS_TIMEOUT_MS = 1800;

/** Manages draft input, send lifecycle, and error handling for the composer. */
export function useMessageComposer({
	selectedConversation,
	onMessageCreated,
}: UseMessageComposerOptions): MessageComposerState {
	const [draftMessage, setDraftMessage] = useState("");
	const [composerError, setComposerError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [sendStatus, setSendStatus] = useState<ComposerSendStatus>({ phase: "idle", messageId: null });
	const sentStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearSentStatusTimeout = useCallback(() => {
		if (sentStatusTimeoutRef.current) {
			clearTimeout(sentStatusTimeoutRef.current);
			sentStatusTimeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		clearSentStatusTimeout();
		setDraftMessage("");
		setComposerError(null);
		setIsSending(false);
		setSendStatus({ phase: "idle", messageId: null });
	}, [clearSentStatusTimeout, selectedConversation?.id]);

	useEffect(() => {
		return () => {
			clearSentStatusTimeout();
		};
	}, [clearSentStatusTimeout]);

	const handleComposerChange = useCallback((value: string) => {
		setDraftMessage(value);
		setComposerError((currentError) => (currentError ? null : currentError));
		setSendStatus((currentStatus) =>
			currentStatus.phase === "failed" ? { phase: "idle", messageId: null } : currentStatus,
		);
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
		setSendStatus({ phase: "sending", messageId: null });
		clearSentStatusTimeout();

		const conversationId = selectedConversation.id;
		setDraftMessage("");

		try {
			const createdMessage = await createMessage(conversationId, trimmedBody);
			setSendStatus({ phase: "sent", messageId: createdMessage.id });
			sentStatusTimeoutRef.current = setTimeout(() => {
				setSendStatus({ phase: "idle", messageId: null });
				sentStatusTimeoutRef.current = null;
			}, SENT_STATUS_TIMEOUT_MS);
			void onMessageCreated();
		} catch (error) {
			setDraftMessage(trimmedBody);
			setComposerError(toComposerErrorMessage(error));
			setSendStatus({ phase: "failed", messageId: null });
		} finally {
			setIsSending(false);
		}
	}, [clearSentStatusTimeout, draftMessage, isSending, onMessageCreated, selectedConversation]);

	return {
		draftMessage,
		composerError,
		isSending,
		sendStatus,
		handleComposerChange,
		handleComposerSubmit,
	};
}
