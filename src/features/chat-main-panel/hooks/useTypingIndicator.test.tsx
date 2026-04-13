import { renderHook } from "@testing-library/react";
import { act } from "react";

import { useTypingIndicator } from "./useTypingIndicator";

describe("useTypingIndicator", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("emits typing true once and false after timeout", () => {
		const sendTyping = vi.fn();
		const { result } = renderHook(() =>
			useTypingIndicator({
				conversationId: "1",
				sendTyping,
				timeoutMs: 500,
			}),
		);

		act(() => {
			result.current.handleTypingChange("hello");
		});
		expect(sendTyping).toHaveBeenCalledTimes(1);
		expect(sendTyping).toHaveBeenNthCalledWith(1, true);

		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(sendTyping).toHaveBeenCalledTimes(2);
		expect(sendTyping).toHaveBeenNthCalledWith(2, false);
	});

	it("stops typing immediately when input becomes empty", () => {
		const sendTyping = vi.fn();
		const { result } = renderHook(() =>
			useTypingIndicator({
				conversationId: "1",
				sendTyping,
			}),
		);

		act(() => {
			result.current.handleTypingChange("hello");
		});
		act(() => {
			result.current.handleTypingChange("   ");
		});

		expect(sendTyping).toHaveBeenCalledTimes(2);
		expect(sendTyping).toHaveBeenNthCalledWith(1, true);
		expect(sendTyping).toHaveBeenNthCalledWith(2, false);
	});

	it("emits stop typing when conversation changes", () => {
		const sendTyping = vi.fn();
		const { result, rerender } = renderHook(
			({ conversationId }: { conversationId: string | null }) =>
				useTypingIndicator({
					conversationId,
					sendTyping,
				}),
			{
				initialProps: { conversationId: "1" },
			},
		);

		act(() => {
			result.current.handleTypingChange("typing");
		});

		rerender({ conversationId: "2" });
		expect(sendTyping).toHaveBeenCalledWith(false);
	});
});
