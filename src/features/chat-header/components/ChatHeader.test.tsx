import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import { ChatHeader } from "./ChatHeader";

function PathnameProbe() {
	const { pathname } = useLocation();
	return <span data-testid="pathname">{pathname}</span>;
}

function renderWithRouter(ui: ReactElement, initialEntries = ["/chat/1"]) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe("ChatHeader", () => {
	it("renders contact name and presence label", () => {
		renderWithRouter(<ChatHeader contactName="Alice" presenceLabel="Online" />);

		expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Online").length).toBeGreaterThan(0);
	});

	it("renders typing state from presence label", () => {
		renderWithRouter(<ChatHeader contactName="Alice" presenceLabel="typing..." />);

		expect(screen.getAllByText("typing...").length).toBeGreaterThan(0);
	});

	it("navigates to /chat when back button is clicked", async () => {
		const user = userEvent.setup();

		renderWithRouter(
			<>
				<PathnameProbe />
				<ChatHeader contactName="Alice" presenceLabel="Online" />
			</>,
			["/chat/123"],
		);

		expect(screen.getByTestId("pathname")).toHaveTextContent("/chat/123");

		await user.click(screen.getByRole("button", { name: "Back to chats" }));

		expect(screen.getByTestId("pathname")).toHaveTextContent("/chat");
	});
});
