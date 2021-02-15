import "jest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useLoadingState } from "../useLoadingState";

describe("useLoadingState", () => {
  it("should not be loading initially", () => {
    const { result } = renderHook(() => useLoadingState());
    expect(result.current[0]).toBe(false);
  });

  it("should start loading when a task starts", () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      const [_, start] = result.current;
      start();
    });
    expect(result.current[0]).toBe(true);
  });

  it("should stop loading when all tasks have ended", () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      const [_, start, end] = result.current;
      start();
      end();
    });
    expect(result.current[0]).toBe(false);
  });

  it("should not stop loading when if some task is still ongoing", () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      const [_, start, end] = result.current;
      start();
      start();
      end();
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      const [_, __, end] = result.current;
      end();
    });
    expect(result.current[0]).toBe(false);
  });

  it("should use memoized callback refs", () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    const [_, startRef, endRef] = result.current;
    rerender();
    expect(startRef).toBe(result.current[1]);
    expect(endRef).toBe(result.current[2]);
  });
});
