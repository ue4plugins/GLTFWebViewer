import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "../lib/Viewer";

interface Props {
  modelName?: string;
}

export const PlayCanvas: React.FC<Props> = ({ modelName }) => {
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
    if (!viewer || !modelName) {
      return;
    }
    viewer.loadModel(`./assets/models/${modelName}/glTF/${modelName}.gltf`);
    return () => {
      viewer.destroyScene();
    };
  }, [viewer, modelName]);

  return <canvas ref={canvasEl} />;
};
