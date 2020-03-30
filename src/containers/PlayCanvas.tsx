import React, { useEffect, useRef, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Viewer } from "../lib/Viewer";
import { useStores } from "../stores";
import { useLoadingState } from "./useLoadingState";

// TODO: remove
const delay = (duration: number) =>
  new Promise(resolve => {
    setTimeout(() => resolve(), duration);
  });

export const PlayCanvas: React.FC<{}> = observer(() => {
  const { modelStore, sceneStore } = useStores();
  const { model } = modelStore;
  const { scene } = sceneStore;
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Viewer>();
  const [isLoading, startLoadingTask, endLoadingTask] = useLoadingState();
  const [isError, setIsError] = useState(false);

  const runAsyncWithErrorAndLoadingHandling = useCallback(
    async (fn: () => Promise<void>) => {
      setIsError(false);
      startLoadingTask();
      try {
        await fn();
      } catch (error) {
        setIsError(true);
        endLoadingTask();
        throw error;
      }
      endLoadingTask();
    },
    [startLoadingTask, endLoadingTask],
  );

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }

    const viewer = new Viewer(canvasEl.current);

    runAsyncWithErrorAndLoadingHandling(async () => {
      await viewer.configure();
      await delay(1000);
      setViewer(viewer);
    });

    return () => {
      viewer.destroy();
    };
  }, [runAsyncWithErrorAndLoadingHandling]);

  useEffect(() => {
    if (!viewer || !model) {
      return;
    }

    runAsyncWithErrorAndLoadingHandling(async () => {
      await viewer.loadModel(`${model.path}/${model.name}.gltf`);
      await delay(1000);
    });

    return () => {
      viewer.destroyModel();
    };
  }, [runAsyncWithErrorAndLoadingHandling, viewer, model]);

  useEffect(() => {
    if (!viewer || !scene) {
      return;
    }

    runAsyncWithErrorAndLoadingHandling(async () => {
      await viewer.loadScene(scene.path);
    });

    return () => {
      viewer.destroyScene();
    };
  }, [runAsyncWithErrorAndLoadingHandling, viewer, scene]);

  return (
    <>
      {isLoading ? "Loading..." : null}
      {isError ? "Error!" : null}
      <canvas ref={canvasEl} />
    </>
  );
});
