import { useCallback, useState } from "react";

export const useLoadingState = (): [boolean, () => void, () => void] => {
  const [loadingCount, setLoadingCount] = useState(0);

  const onHandleIncrement = useCallback(() => setLoadingCount(c => c + 1), []);
  const onHandleDecrement = useCallback(() => setLoadingCount(c => c - 1), []);

  return [loadingCount > 0, onHandleIncrement, onHandleDecrement];
};
