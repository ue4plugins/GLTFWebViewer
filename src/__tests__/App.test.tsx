import React from "react";
import { render } from "@testing-library/react";
import { RootContainer } from "../containers/RootContainer";

describe("App", () => {
  it("should render learn react link", () => {
    const { getByText } = render(<RootContainer />);
    const linkElement = getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});
