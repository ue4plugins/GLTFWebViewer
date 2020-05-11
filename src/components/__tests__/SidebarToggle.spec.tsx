import "jest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SidebarToggle } from "..";

const openButtonId = "open-button";

describe("SidebarToggle", () => {
  it("should not be visible if isOpen is true", () => {
    const { getByTestId } = render(
      <SidebarToggle isOpen={true} setIsOpen={jest.fn()} />,
    );
    expect(getByTestId(openButtonId)).not.toBeVisible();
  });

  it("should be visible if isOpen is false", () => {
    const { getByTestId } = render(
      <SidebarToggle isOpen={false} setIsOpen={jest.fn()} />,
    );
    expect(getByTestId(openButtonId)).toBeVisible();
  });

  it("should call setIsOpen with 'true' when close button is clicked", () => {
    const setIsOpen = jest.fn((open: boolean) => open);
    const { getByTestId } = render(
      <SidebarToggle isOpen={true} setIsOpen={setIsOpen} />,
    );
    fireEvent.click(getByTestId(openButtonId));
    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen.mock.calls[0][0]).toBe(true);
  });
});
