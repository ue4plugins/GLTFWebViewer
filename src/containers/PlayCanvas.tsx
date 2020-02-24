import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "../lib/Viewer";

interface Props {
  model?: GLTF_MODEL;
}

export const PlayCanvas: React.FC<Props> = ({ model }) => {
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

  return <canvas ref={canvasEl} />;
};
