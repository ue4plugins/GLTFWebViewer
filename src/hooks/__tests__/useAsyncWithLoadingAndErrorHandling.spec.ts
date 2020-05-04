import "jest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useAsyncWithLoadingAndErrorHandling } from "../useAsyncWithLoadingAndErrorHandling";

const delay = (duration: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), duration);
  });

describe("useAsyncWithLoadingAndErrorHandling", () => {
  const originalConsoleError = console.error;
  afterEach(() => (console.error = originalConsoleError));

  it("should not be loading initially", () => {
    const { result } = renderHook(() => useAsyncWithLoadingAndErrorHandling());
    expect(result.current[0]).toBe(false);
  });

  it("should not have an error state initially", () => {
    const { result } = renderHook(() => useAsyncWithLoadingAndErrorHandling());
    expect(result.current[1]).toBe(false);
  });

  it("should start/end loading when an async task starts/ends", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsyncWithLoadingAndErrorHandling(),
    );
    await act(async () => {
      const [_, __, runAsync] = result.current;
      runAsync(() => delay(100));
      await waitForNextUpdate();
      expect(result.current[0]).toBe(true);
      await waitForNextUpdate();
      expect(result.current[0]).toBe(false);
    });
  });

  describe("state error handling", () => {
    it("should set an error state if the async callback fails", async () => {
      const {
        result,
        waitForNextUpdate,
        waitForValueToChange,
      } = renderHook(() => useAsyncWithLoadingAndErrorHandling());

      await act(async () => {
        const [_, __, runAsync] = result.current;

        const waitForError = waitForValueToChange(() => result.current[1]);

        // Error state should be set if error is thrown
        try {
          await runAsync(async () => {
            await delay(100);
            throw new Error("Oh noes");
          });
        } catch (e) {
          // Suppress
        }

        await waitForError;
        expect(result.current[1]).toBe(true);

        // Error state should be reset if another callback is fired
        runAsync(async () => delay(100));
        await waitForNextUpdate();
        expect(result.current[1]).toBe(false);
      });
    });
  });

  it("should use memoized callback refs", () => {
    const { result, rerender } = renderHook(() =>
      useAsyncWithLoadingAndErrorHandling(),
    );
    const [_, __, runAsyncRef] = result.current;
    rerender();
    expect(runAsyncRef).toBe(result.current[2]);
  });
});
