import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MessageComposer } from "./MessageComposer";

describe("MessageComposer", () => {
	it("calls onChange when typing into composer", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<MessageComposer value="" onChange={onChange} onSend={vi.fn()} />);

		await user.type(screen.getByPlaceholderText("Write a message ..."), "hello");
		expect(onChange).toHaveBeenCalled();
	});

	it("calls onSend on submit when enabled and value is not empty", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();

		render(<MessageComposer value="hello" onChange={vi.fn()} onSend={onSend} />);

		await user.click(screen.getByRole("button", { name: "Send message" }));
		expect(onSend).toHaveBeenCalledTimes(1);
	});

	it("disables submit when value is whitespace", () => {
		render(<MessageComposer value="   " onChange={vi.fn()} onSend={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
	});

	it("renders error text when error prop is provided", () => {
		render(<MessageComposer value="hello" onChange={vi.fn()} onSend={vi.fn()} error="Unable to send right now." />);

		expect(screen.getByText("Unable to send right now.")).toBeInTheDocument();
	});
});
