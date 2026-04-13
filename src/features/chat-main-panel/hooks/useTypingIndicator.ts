import { useRef, useCallback, useEffect } from "react";

interface UseTypingIndicatorProps {
	conversationId: string | null;
	sendTyping: (isTyping: boolean) => void;
	timeoutMs?: number;
}

export function useTypingIndicator({ conversationId, sendTyping, timeoutMs = 1200 }: UseTypingIndicatorProps) {
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);

	const clearTypingTimeout = useCallback(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
	}, []);

	const emitTyping = useCallback(
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
		emitTyping(false);
	}, [clearTypingTimeout, emitTyping]);

	const handleTypingChange = useCallback(
		(value: string) => {
			const hasText = value.trim().length > 0;

			if (!hasText) {
				stopTyping();
				return;
			}

			emitTyping(true);
			clearTypingTimeout();

			typingTimeoutRef.current = setTimeout(() => {
				emitTyping(false);
				typingTimeoutRef.current = null;
			}, timeoutMs);
		},
		[clearTypingTimeout, emitTyping, stopTyping, timeoutMs],
	);

	useEffect(() => {
		return () => {
			stopTyping();
		};
	}, [stopTyping]);

	useEffect(() => {
		stopTyping();
	}, [conversationId, stopTyping]);

	return {
		handleTypingChange,
		stopTyping,
	};
}
