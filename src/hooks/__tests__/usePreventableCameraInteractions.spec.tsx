import "jest";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { fireEvent, render } from "@testing-library/react";
import { usePreventableCameraInteractions } from "../usePreventableCameraInteractions";
import { PreventableEvent } from "../../playcanvas";

describe("usePreventableCameraInteractions", () => {
  const keyDownMockEventHandler = jest.fn((_: Event) => false);
  const mouseDownMockEventHandler = jest.fn((_: Event) => false);
  const wheelMockEventHandler = jest.fn((_: Event) => false);

  beforeAll(() => {
    window.addEventListener("keydown", keyDownMockEventHandler);
    window.addEventListener("mousedown", mouseDownMockEventHandler);
    window.addEventListener("wheel", wheelMockEventHandler);
  });
  afterAll(() => {
    window.removeEventListener("keydown", keyDownMockEventHandler);
    window.removeEventListener("mousedown", mouseDownMockEventHandler);
    window.removeEventListener("wheel", wheelMockEventHandler);
  });
  beforeEach(() => {
    keyDownMockEventHandler.mockReset();
    mouseDownMockEventHandler.mockReset();
    wheelMockEventHandler.mockReset();
  });

  it("should add 'prevent' attribute to events if preventInteraction is set", () => {
    const { result } = renderHook(() => usePreventableCameraInteractions());
    act(() => {
      const [setPreventInteraction] = result.current;
      setPreventInteraction(true);
    });

    const { container } = render(<input />);
    fireEvent.keyDown(container.getElementsByTagName("input")[0]);

    expect(keyDownMockEventHandler.mock.calls.length).toBe(1);
    expect(
      (keyDownMockEventHandler.mock.calls[0][0] as PreventableEvent).prevent,
    ).toBe(true);
  });

  it("should not add 'prevent' attribute to events if preventInteraction is set and unset", () => {
    const { result } = renderHook(() => usePreventableCameraInteractions());
    act(() => {
      const [setPreventInteraction] = result.current;
      setPreventInteraction(true);
      setPreventInteraction(false);
    });

    const { container } = render(<input />);
    fireEvent.keyDown(container.getElementsByTagName("input")[0]);

    expect(keyDownMockEventHandler.mock.calls.length).toBe(1);
    expect(
      (keyDownMockEventHandler.mock.calls[0][0] as PreventableEvent).prevent,
    ).toBe(undefined);
  });

  it("should affect 'keydown', 'wheel' and 'mousedown' events", () => {
    const { result } = renderHook(() => usePreventableCameraInteractions());
    act(() => {
      const [setPreventInteraction] = result.current;
      setPreventInteraction(true);
    });

    const { container } = render(<input />);
    const elem = container.getElementsByTagName("input")[0];
    fireEvent.keyDown(elem);
    fireEvent.mouseDown(elem);
    fireEvent.wheel(elem);

    expect(keyDownMockEventHandler.mock.calls.length).toBe(1);
    expect(
      (keyDownMockEventHandler.mock.calls[0][0] as PreventableEvent).prevent,
    ).toBe(true);

    expect(mouseDownMockEventHandler.mock.calls.length).toBe(1);
    expect(
      (mouseDownMockEventHandler.mock.calls[0][0] as PreventableEvent).prevent,
    ).toBe(true);

    expect(wheelMockEventHandler.mock.calls.length).toBe(1);
    expect(
      (wheelMockEventHandler.mock.calls[0][0] as PreventableEvent).prevent,
    ).toBe(true);
  });
});
