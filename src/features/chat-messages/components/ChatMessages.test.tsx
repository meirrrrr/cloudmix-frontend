import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatMessages } from "./ChatMessages";
import type { ChatMessagePayload } from "../types";

function makeMessage(id: number, body: string, createdAt = "2026-04-15T12:00:00.000Z"): ChatMessagePayload {
	return {
		id,
		body,
		created_at: createdAt,
		sender: {
			id: 1,
			username: "alice",
			display_name: "Alice",
			is_online: true,
			last_seen_at: null,
		},
	};
}

const idleStatus = { phase: "idle" as const, messageId: null };

describe("ChatMessages", () => {
	it("renders history loader when there are no messages and history is loading", () => {
		render(
			<ChatMessages
				messages={[]}
				sendStatus={idleStatus}
				isHistoryLoading
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				chatError={null}
			/>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("Loading messages…")).toBeInTheDocument();
		expect(screen.queryByText("Start your conversation")).not.toBeInTheDocument();
	});

	it("renders empty state when there are no messages and history is not loading", () => {
		render(
			<ChatMessages
				messages={[]}
				sendStatus={idleStatus}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				chatError={null}
			/>,
		);

		expect(screen.getByText("Start your conversation")).toBeInTheDocument();
	});

	it("renders message bubbles", () => {
		render(
			<ChatMessages
				messages={[makeMessage(1, "First message")]}
				currentUserId={1}
				sendStatus={idleStatus}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				chatError={null}
			/>,
		);

		expect(screen.getByText("First message")).toBeInTheDocument();
	});

	it("calls onLoadOlderHistory when clicking load older button", async () => {
		const user = userEvent.setup();
		const onLoadOlderHistory = vi.fn();

		render(
			<ChatMessages
				messages={[]}
				sendStatus={idleStatus}
				isHistoryLoading={false}
				hasMoreHistory
				isLoadingMoreHistory={false}
				chatError={null}
				onLoadOlderHistory={onLoadOlderHistory}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Load older messages" }));
		expect(onLoadOlderHistory).toHaveBeenCalledTimes(1);
	});

	it("shows send status text", () => {
		render(
			<ChatMessages
				messages={[]}
				sendStatus={{ phase: "sending", messageId: null }}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				chatError={null}
			/>,
		);

		expect(screen.getByText("Sending...")).toBeInTheDocument();
	});

	it("shows chat error text", () => {
		render(
			<ChatMessages
				messages={[]}
				sendStatus={idleStatus}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				chatError="Socket disconnected"
			/>,
		);

		expect(screen.getByText("Chat error: Socket disconnected")).toBeInTheDocument();
	});
});
