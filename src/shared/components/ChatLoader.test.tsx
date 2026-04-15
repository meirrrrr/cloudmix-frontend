import { render } from "@testing-library/react";

import { ChatLoader } from "./ChatLoader";

describe("ChatLoader", () => {
	it("renders seven message skeleton rows", () => {
		const { container } = render(<ChatLoader />);
		expect(container.querySelectorAll(".h-14").length).toBe(7);
	});
});
