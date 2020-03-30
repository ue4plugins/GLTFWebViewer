import { Reducer, useCallback, useReducer } from "react";

const reducer: Reducer<number, "increment" | "decrement"> = (state, action) => {
  switch (action) {
    case "increment": {
      return state + 1;
    }
    case "decrement": {
      return state - 1;
    }
    default: {
      return state;
    }
  }
};

export const useLoadingState = (): [boolean, () => void, () => void] => {
  const [loadingCount, dispatch] = useReducer(reducer, 0);

  const onHandleIncrement = useCallback(() => {
    dispatch("increment");
  }, []);
  const onHandleDecrement = useCallback(() => {
    dispatch("decrement");
  }, []);

  const isLoading = loadingCount > 0;

  return [isLoading, onHandleIncrement, onHandleDecrement];
};
