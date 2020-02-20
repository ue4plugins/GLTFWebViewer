import React, { useEffect } from "react";
import pc from "playcanvas";

interface Props {
  app: pc.Application;
}

export const Light: React.FC<Props> = ({ app }) => {
  useEffect(() => {
    const light = new pc.Entity("light");
    light.addComponent("light", {
      type: "point",
      color: new pc.Color(1, 1, 1),
      range: 100,
      castShadows: true,
    });
    app.root.addChild(light);
    light.setLocalPosition(2, 4, 5);
    light.setEulerAngles(45, 0, 45);
    return (): void => {
      app.root.removeChild(light);
    };
  });
  return null;
};
