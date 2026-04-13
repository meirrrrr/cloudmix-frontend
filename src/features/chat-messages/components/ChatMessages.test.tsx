import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatMessages } from "./ChatMessages";
import type { ChatMessagePayload, PresenceUser } from "@/features/chat/types";

const sender: PresenceUser = {
	id: 42,
	username: "friend",
	display_name: "Friend User",
	is_online: true,
	last_seen_at: null,
};

function buildMessage(id: number, body: string): ChatMessagePayload {
	return {
		id,
		body,
		created_at: "2026-04-13T10:00:00Z",
		sender,
	};
}

describe("ChatMessages", () => {
	it("renders empty state when there are no messages", () => {
		render(
			<ChatMessages
				messages={[]}
				currentUserId={1}
				visibleMessageIds={{}}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				socketError={null}
			/>,
		);

		expect(screen.getByText("Start your conversation")).toBeInTheDocument();
		expect(screen.getByText("No messages yet. Send one to begin.")).toBeInTheDocument();
	});

	it("calls history loader when clicking load older button", async () => {
		const user = userEvent.setup();
		const onLoadOlderHistory = vi.fn();

		render(
			<ChatMessages
				messages={[buildMessage(1, "Hello there")]}
				currentUserId={1}
				visibleMessageIds={{ "1": true }}
				isHistoryLoading={false}
				hasMoreHistory
				isLoadingMoreHistory={false}
				socketError={null}
				onLoadOlderHistory={onLoadOlderHistory}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Load older messages" }));
		expect(onLoadOlderHistory).toHaveBeenCalledTimes(1);
	});

	it("shows socket error text when websocket fails", () => {
		render(
			<ChatMessages
				messages={[buildMessage(2, "Message with error state")]}
				currentUserId={1}
				visibleMessageIds={{ "2": true }}
				isHistoryLoading={false}
				hasMoreHistory={false}
				isLoadingMoreHistory={false}
				socketError="connection dropped"
			/>,
		);

		expect(screen.getByText("Chat error: connection dropped")).toBeInTheDocument();
	});
});
