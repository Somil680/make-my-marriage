import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test scaffold", () => {
  it("renders with React Testing Library", () => {
    render(<p>Make My Marriage</p>);

    expect(screen.getByText("Make My Marriage")).toBeInTheDocument();
  });
});
