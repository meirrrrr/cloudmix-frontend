import { renderHook } from "@testing-library/react";
import { act } from "react";

import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns current value immediately on first render", () => {
		const { result } = renderHook(() => useDebouncedValue("hello", 300));
		expect(result.current).toBe("hello");
	});

	it("updates value only after delay elapses", () => {
		const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
			initialProps: { value: "first" },
		});

		rerender({ value: "second" });
		expect(result.current).toBe("first");

		act(() => {
			vi.advanceTimersByTime(299);
		});
		expect(result.current).toBe("first");

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe("second");
	});
});
