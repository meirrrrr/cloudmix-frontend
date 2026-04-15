import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useMessageComposer, type ComposerSendStatus } from "../hooks/useMessageComposer";
import { useConversationContext } from "./ConversationContext";

interface MessageComposerContextValue {
	composerValue: string;
	composerError: string | null;
	isSending: boolean;
	sendStatus: ComposerSendStatus;
	handleComposerChange: (value: string) => void;
	handleComposerSubmit: () => Promise<void>;
}

const MessageComposerContext = createContext<MessageComposerContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useMessageComposerContext(): MessageComposerContextValue {
	const ctx = useContext(MessageComposerContext);
	if (!ctx) throw new Error("useMessageComposerContext must be used within MessageComposerProvider");
	return ctx;
}

export function MessageComposerProvider({ children }: { children: ReactNode }) {
	const { selectedConversation } = useConversationContext();

	const { draftMessage, composerError, isSending, sendStatus, handleComposerChange, handleComposerSubmit } =
		useMessageComposer({ selectedConversation });

	const value = useMemo<MessageComposerContextValue>(
		() => ({
			composerValue: draftMessage,
			composerError,
			isSending,
			sendStatus,
			handleComposerChange,
			handleComposerSubmit,
		}),
		[draftMessage, composerError, isSending, sendStatus, handleComposerChange, handleComposerSubmit],
	);

	return <MessageComposerContext.Provider value={value}>{children}</MessageComposerContext.Provider>;
}
