import "jest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Sidebar } from "..";

const closeButtonId = "close-button";

describe("Sidebar", () => {
  it("should not be visible if isOpen is false", () => {
    const { getByTestId } = render(
      <Sidebar isOpen={false} setIsOpen={jest.fn()} />,
    );
    expect(getByTestId(closeButtonId)).not.toBeVisible();
  });

  it("should be visible if isOpen is true", () => {
    const { getByTestId } = render(
      <Sidebar isOpen={true} setIsOpen={jest.fn()} />,
    );
    expect(getByTestId(closeButtonId)).toBeVisible();
  });

  it("should call setIsOpen with 'false' when close button is clicked", () => {
    const setIsOpen = jest.fn((open: boolean) => open);
    const { getByTestId } = render(
      <Sidebar isOpen={true} setIsOpen={setIsOpen} />,
    );
    fireEvent.click(getByTestId(closeButtonId));
    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen.mock.calls[0][0]).toBe(false);
  });

  it("should render children", () => {
    const { getByText } = render(
      <Sidebar isOpen={true} setIsOpen={jest.fn()}>
        <span>Inner content</span>
      </Sidebar>,
    );
    expect(getByText(/^Inner content/)).toBeInTheDocument();
  });
});
