import { useCallback, useState } from "react";
import { useLoadingState } from "./useLoadingState";

export const useAsyncWithLoadingAndErrorHandling = (): [
  boolean,
  boolean,
  (fn: () => Promise<void>) => void,
] => {
  const [isLoading, startLoadingTask, endLoadingTask] = useLoadingState();
  const [isError, setIsError] = useState(false);

  const runAsync = useCallback(
    async (callback: () => Promise<void>) => {
      setIsError(false);
      startLoadingTask();
      try {
        await callback();
      } catch (error) {
        console.error(error);
        setIsError(true);
        endLoadingTask();
        return;
      }
      endLoadingTask();
    },
    [startLoadingTask, endLoadingTask, setIsError],
  );

  return [isLoading, isError, runAsync];
};
