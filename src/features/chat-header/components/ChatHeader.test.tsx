import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatHeader } from "./ChatHeader";

describe("ChatHeader", () => {
	it("renders contact name and presence label", () => {
		render(<ChatHeader contactName="Alice" presenceLabel="Online" peerIsTyping={false} />);

		expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Online").length).toBeGreaterThan(0);
	});

	it("shows typing state when peer is typing", () => {
		render(<ChatHeader contactName="Alice" presenceLabel="Online" peerIsTyping />);

		expect(screen.getAllByText("typing...").length).toBeGreaterThan(0);
	});

	it("calls back handler when back button is clicked", async () => {
		const user = userEvent.setup();
		const onBackToList = vi.fn();

		render(
			<ChatHeader contactName="Alice" presenceLabel="Online" peerIsTyping={false} onBackToList={onBackToList} />,
		);

		await user.click(screen.getByRole("button", { name: "Back to chats" }));
		expect(onBackToList).toHaveBeenCalledTimes(1);
	});
});
