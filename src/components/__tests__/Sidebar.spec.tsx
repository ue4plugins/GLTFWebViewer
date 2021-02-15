import "jest";
import React from "react";
import { render } from "@testing-library/react";
import { Sidebar } from "..";

const sidebarId = "sidebar";

describe("Sidebar", () => {
  it("should not be visible if open is false", () => {
    const { getByTestId } = render(<Sidebar open={false} />);
    expect(getByTestId(sidebarId)).not.toBeVisible();
  });

  it("should be visible if open is true", () => {
    const { getByTestId } = render(<Sidebar open={true} />);
    expect(getByTestId(sidebarId)).toBeVisible();
  });

  it("should render children", () => {
    const { getByText } = render(
      <Sidebar open={true}>
        <span>Inner content</span>
      </Sidebar>,
    );
    expect(getByText(/^Inner content/)).toBeInTheDocument();
  });
});
