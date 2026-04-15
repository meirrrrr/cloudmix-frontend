import { render, screen } from "@testing-library/react";

import { DateDivider } from "./DateDivider";

describe("DateDivider", () => {
	it("renders label text", () => {
		render(<DateDivider label="Today" />);
		expect(screen.getByText("Today")).toBeInTheDocument();
	});
});
