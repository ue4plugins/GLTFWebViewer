import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Viewer } from "../lib/Viewer";
import { useStores } from "../stores";

export const PlayCanvas: React.FC<{}> = observer(() => {
  const { modelStore, skyboxStore } = useStores();
  const { model } = modelStore;
  const { skybox } = skyboxStore;
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Viewer>();

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }
    const viewer = new Viewer(canvasEl.current);
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
      viewer.destroyScene();
    };
  }, [viewer, model]);

  useEffect(() => {
    if (!viewer || !skybox) {
      return;
    }
    viewer.setSkybox(skybox);
  }, [viewer, skybox]);

  return <canvas ref={canvasEl} />;
});
