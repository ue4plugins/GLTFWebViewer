import React, { useEffect } from "react";
import pc from "playcanvas";

interface Props {
  app: pc.Application;
}

// const backgroundColor = [255, 255, 255];

export const Camera: React.FC<Props> = ({ app }) => {
  useEffect(() => {
    // create camera entity
    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      clearColor: new pc.Color(0.4, 0.45, 0.5),
    });
    app.root.addChild(camera);
    camera.setLocalPosition(0, 0, 5);
    return (): void => {
      app.root.removeChild(camera);
    };
  });
  return null;
};
