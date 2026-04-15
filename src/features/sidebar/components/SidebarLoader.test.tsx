import { render } from "@testing-library/react";

import { SidebarLoader } from "./SidebarLoader";

describe("SidebarLoader", () => {
	it("renders pulse placeholders", () => {
		const { container } = render(<SidebarLoader />);
		expect(container.querySelectorAll(".animate-pulse").length).toBe(12);
	});
});
