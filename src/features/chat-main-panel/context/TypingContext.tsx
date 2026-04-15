import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useTyping } from "../hooks/useTyping";
import { useConversationContext } from "./ConversationContext";
import { useMessageComposerContext } from "./MessageComposerContext";

interface TypingContextValue {
	handleComposerChange: (value: string) => void;
	handleComposerSubmit: () => Promise<void>;
}

const TypingContext = createContext<TypingContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useTypingContext(): TypingContextValue {
	const ctx = useContext(TypingContext);
	if (!ctx) throw new Error("useTypingContext must be used within TypingProvider");
	return ctx;
}

export function TypingProvider({ children }: { children: ReactNode }) {
	const { selectedConversation, sendTyping } = useConversationContext();
	const { handleComposerChange: rawHandleChange, handleComposerSubmit: rawHandleSubmit } =
		useMessageComposerContext();

	const conversationId = selectedConversation?.id ?? null;

	const { stopTyping, handleTypingChange } = useTyping({
		selectedConversationId: conversationId,
		sendTyping,
		onComposerChange: rawHandleChange,
	});

	const handleComposerSubmit = useCallback(async () => {
		await rawHandleSubmit();
		stopTyping();
	}, [rawHandleSubmit, stopTyping]);

	const value = useMemo<TypingContextValue>(
		() => ({ handleComposerChange: handleTypingChange, handleComposerSubmit }),
		[handleTypingChange, handleComposerSubmit],
	);

	return <TypingContext.Provider value={value}>{children}</TypingContext.Provider>;
}
