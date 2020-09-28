import "jest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SidebarToggle } from "..";

const sidebarToggleId = "sidebar-toggle";

describe("SidebarToggle", () => {
  it("should call toggleOpen with 'true' when button is clicked if current value is 'false'", () => {
    const setIsOpen = jest.fn((open: boolean) => open);
    const { getByTestId } = render(
      <SidebarToggle open={false} toggleOpen={setIsOpen} />,
    );
    fireEvent.click(getByTestId(sidebarToggleId));
    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen.mock.calls[0][0]).toBe(true);
  });

  it("should call toggleOpen with 'false' when button is clicked if current value is 'true'", () => {
    const setIsOpen = jest.fn((open: boolean) => open);
    const { getByTestId } = render(
      <SidebarToggle open={true} toggleOpen={setIsOpen} />,
    );
    fireEvent.click(getByTestId(sidebarToggleId));
    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen.mock.calls[0][0]).toBe(false);
  });
});
