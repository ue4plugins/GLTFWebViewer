import { useCallback, useState, useEffect } from "react";
import { PreventableEvent } from "../lib/PreventableEvent";

export const usePreventableCameraInteractions = (
  initialPrevent = false,
): [(prevent: boolean) => void] => {
  const [preventInteraction, setPreventInteraction] = useState(initialPrevent);

  const handler = useCallback((e: Event) => {
    (e as PreventableEvent<Event>).prevent = true;
  }, []);

  useEffect(() => {
    function attachHandlers() {
      document.body.addEventListener("keydown", handler);
      document.body.addEventListener("wheel", handler);
      document.body.addEventListener("mousedown", handler);
    }

    function detachHandlers() {
      document.body.removeEventListener("keydown", handler);
      document.body.removeEventListener("wheel", handler);
      document.body.removeEventListener("mousedown", handler);
    }

    if (preventInteraction) {
      attachHandlers();
    } else {
      detachHandlers();
    }

    return detachHandlers;
  }, [handler, preventInteraction]);

  return [setPreventInteraction];
};
