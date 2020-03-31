import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Viewer } from "../lib/Viewer";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";

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
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }

    const viewer = new Viewer(canvasEl.current);

    runAsync(async () => {
      await viewer.configure();
      await delay(1000);
      setViewer(viewer);
    });

    return () => {
      viewer.destroy();
    };
  }, [runAsync]);

  useEffect(() => {
    if (!viewer || !model) {
      return;
    }

    runAsync(async () => {
      await viewer.loadModel(`${model.path}/${model.name}.gltf`);
      await delay(1000);
    });

    return () => {
      viewer.destroyModel();
    };
  }, [runAsync, viewer, model]);

  useEffect(() => {
    if (!viewer || !scene) {
      return;
    }

    runAsync(async () => {
      await viewer.loadScene(scene.path);
    });

    return () => {
      viewer.destroyScene();
    };
  }, [runAsync, viewer, scene]);

  return (
    <>
      {isLoading ? "Loading..." : null}
      {isError ? "Error!" : null}
      <canvas ref={canvasEl} />
    </>
  );
});
