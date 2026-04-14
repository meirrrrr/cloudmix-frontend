import { useCallback, useEffect, useRef } from "react";

interface UseTypingOptions {
	selectedConversationId: number | null;
	sendTyping: (isTyping: boolean) => void;
	onComposerChange: (value: string) => void;
}

interface UseTypingState {
	stopTyping: () => void;
	handleTypingChange: (value: string) => void;
}

const TYPING_TIMEOUT_MS = 1200;

export function useTyping({ selectedConversationId, sendTyping, onComposerChange }: UseTypingOptions): UseTypingState {
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);

	const clearTypingTimeout = useCallback(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
	}, []);

	const emitTypingState = useCallback(
		(nextIsTyping: boolean) => {
			if (isTypingRef.current === nextIsTyping) {
				return;
			}

			isTypingRef.current = nextIsTyping;
			sendTyping(nextIsTyping);
		},
		[sendTyping],
	);

	const stopTyping = useCallback(() => {
		clearTypingTimeout();
		emitTypingState(false);
	}, [clearTypingTimeout, emitTypingState]);

	const handleTypingChange = useCallback(
		(value: string) => {
			onComposerChange(value);

			if (!selectedConversationId) {
				return;
			}

			const hasText = value.trim().length > 0;
			if (!hasText) {
				stopTyping();
				return;
			}

			emitTypingState(true);
			clearTypingTimeout();
			typingTimeoutRef.current = setTimeout(() => {
				emitTypingState(false);
				typingTimeoutRef.current = null;
			}, TYPING_TIMEOUT_MS);
		},
		[clearTypingTimeout, emitTypingState, onComposerChange, selectedConversationId, stopTyping],
	);

	useEffect(() => {
		return () => {
			stopTyping();
		};
	}, [stopTyping]);

	useEffect(() => {
		stopTyping();
	}, [selectedConversationId, stopTyping]);

	return { stopTyping, handleTypingChange };
}
