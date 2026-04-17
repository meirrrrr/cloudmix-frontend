import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Conversation } from "@/features/chat-main-panel/types";

import { MessageComposer } from "./MessageComposer";

vi.mock("@/features/chat-messages/api/messages-api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/features/chat-messages/api/messages-api")>();
	return {
		...actual,
		createMessage: vi.fn(),
	};
});

import { createMessage } from "@/features/chat-messages/api/messages-api";

const mockConversation: Conversation = {
	id: 42,
	updated_at: "2024-01-01T00:00:00Z",
	unread_count: 0,
	is_ai_assistant: false,
	last_message: null,
	peer: {
		id: 2,
		username: "bob",
		display_name: "Bob",
		is_online: true,
		last_seen_at: null,
	},
};

describe("MessageComposer", () => {
	beforeEach(() => {
		vi.mocked(createMessage).mockReset();
	});

	it("calls sendTyping when user types with a conversation selected", async () => {
		const user = userEvent.setup();
		const sendTyping = vi.fn();

		render(<MessageComposer selectedConversation={mockConversation} sendTyping={sendTyping} />);

		await user.type(screen.getByPlaceholderText("Write a message ..."), "h");

		expect(sendTyping).toHaveBeenCalledWith(true);
	});

	it("calls createMessage on submit when draft is non-empty", async () => {
		const user = userEvent.setup();
		const sendTyping = vi.fn();

		vi.mocked(createMessage).mockResolvedValue({
			id: 99,
			body: "hello",
			created_at: "2024-01-01T12:00:00Z",
			sender: {
				id: 1,
				username: "me",
				display_name: "Me",
				is_online: true,
				last_seen_at: null,
			},
		});

		render(<MessageComposer selectedConversation={mockConversation} sendTyping={sendTyping} />);

		await user.type(screen.getByPlaceholderText("Write a message ..."), "hello");
		await user.click(screen.getByRole("button", { name: "Send message" }));

		await waitFor(() => {
			expect(createMessage).toHaveBeenCalledTimes(1);
			expect(createMessage).toHaveBeenCalledWith(42, "hello");
		});
	});

	it("disables submit when draft is only whitespace", async () => {
		const user = userEvent.setup();

		render(<MessageComposer selectedConversation={mockConversation} sendTyping={vi.fn()} />);

		await user.type(screen.getByPlaceholderText("Write a message ..."), "   ");

		expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
	});

	it("renders composer error when send fails", async () => {
		const user = userEvent.setup();

		vi.mocked(createMessage).mockRejectedValue(new Error("network"));

		render(<MessageComposer selectedConversation={mockConversation} sendTyping={vi.fn()} />);

		await user.type(screen.getByPlaceholderText("Write a message ..."), "hello");
		await user.click(screen.getByRole("button", { name: "Send message" }));

		await waitFor(() => {
			expect(screen.getByText("Unable to send message right now. Please try again.")).toBeInTheDocument();
		});
	});
});
