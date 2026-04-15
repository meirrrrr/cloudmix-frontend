import { render, screen } from "@testing-library/react";

import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
	it("renders incoming message text and timestamp", () => {
		render(
			<MessageBubble
				message={{
					id: "1",
					date: "2026-04-15T12:30:00.000Z",
					text: "Hello there",
					direction: "incoming",
				}}
			/>,
		);

		expect(screen.getByText("Hello there")).toBeInTheDocument();
		expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
	});

	it("renders outgoing message", () => {
		render(
			<MessageBubble
				message={{
					id: "2",
					date: "2026-04-15T12:31:00.000Z",
					text: "Outgoing",
					direction: "outgoing",
				}}
			/>,
		);

		expect(screen.getByText("Outgoing")).toBeInTheDocument();
	});
});
