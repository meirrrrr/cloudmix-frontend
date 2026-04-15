import { render, screen } from "@testing-library/react";

import { ChatPlaceholder } from "./ChatPlaceholder";

describe("ChatPlaceholder", () => {
	it("renders placeholder text", () => {
		render(<ChatPlaceholder />);
		expect(screen.getByText("No chat selected")).toBeInTheDocument();
		expect(
			screen.getByText("Choose a conversation from the sidebar or search for a user to start chatting."),
		).toBeInTheDocument();
	});
});
