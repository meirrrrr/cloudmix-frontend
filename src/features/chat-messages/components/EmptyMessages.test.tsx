import { render, screen } from "@testing-library/react";

import { EmptyMessages } from "./EmptyMessages";

describe("EmptyMessages", () => {
	it("renders empty chat state", () => {
		render(<EmptyMessages />);
		expect(screen.getByText("Start your conversation")).toBeInTheDocument();
		expect(screen.getByText("No messages yet. Send one to begin.")).toBeInTheDocument();
	});
});
