import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Viewer } from "../lib/Viewer";
import { useStores } from "../stores";

export const PlayCanvas: React.FC<{}> = observer(() => {
  const { modelStore, sceneStore } = useStores();
  const { model } = modelStore;
  const { scene } = sceneStore;
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Viewer>();

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }
    const viewer = new Viewer(canvasEl.current);
    viewer.configure();
    setViewer(viewer);
    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewer || !model) {
      return;
    }
    viewer.loadModel(`${model.path}/${model.name}.gltf`);
    return () => {
      viewer.destroyModel();
    };
  }, [viewer, model]);

  useEffect(() => {
    if (!viewer || !scene) {
      return;
    }
    viewer.loadScene(scene);
  }, [viewer, scene]);

  return <canvas ref={canvasEl} />;
});
