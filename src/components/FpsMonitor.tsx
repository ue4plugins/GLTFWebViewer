import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react-lite";

const GRAPH_HEIGHT = 29;
const GRAPH_WIDTH = 70;

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 999999,
    position: "fixed",
    height: "46px",
    width: GRAPH_WIDTH + 6 + "px",
    padding: "3px",
    backgroundColor: "#000",
    color: "#00ffff",
    fontSize: "9px",
    lineHeight: "10px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "bold",
    MozBoxSizing: "border-box",
    boxSizing: "border-box",
    pointerEvents: "none",
    bottom: "8px",
    left: "8px",
  },
  graph: {
    position: "absolute",
    left: "3px",
    right: "3px",
    bottom: "3px",
    height: GRAPH_HEIGHT + "px",
    backgroundColor: "#282844",
    MozBoxSizing: "border-box",
    boxSizing: "border-box",
  },
  bar: {
    position: "absolute",
    bottom: 0,
    width: "1px",
    backgroundColor: "#00ffff",
    boxSizing: "border-box",
  },
}));

class FpsCalculator {
  @observable public fps: Array<number> = [];
  private prevTime = Date.now();
  private frames = 0;
  private req = 0;

  public constructor() {
    this.start();
  }

  @computed public get maxFps() {
    return Math.max.apply(Math.max, this.fps);
  }

  @action
  private calc() {
    const currentTime = Date.now();
    const { prevTime, fps } = this;
    const nextFrames = this.frames + 1;
    this.frames = nextFrames;
    if (currentTime > prevTime + 1000) {
      const nextFps = Math.round(
        (nextFrames * 1000) / (currentTime - prevTime),
      );
      const sliceStart = Math.min(fps.length + 1 - GRAPH_WIDTH, 0);
      this.fps = [...fps, nextFps].slice(sliceStart);
      this.prevTime = currentTime;
      this.frames = 0;
    }
    this.start();
  }

  public start() {
    this.req = requestAnimationFrame(this.calc.bind(this));
  }

  public destroy() {
    cancelAnimationFrame(this.req);
  }
}

export const FpsMonitor: React.FC = observer(() => {
  const classes = useStyles();
  const [calculator, setCalculator] = useState<FpsCalculator>();

  useEffect(() => {
    const instance = new FpsCalculator();
    setCalculator(instance);
    return () => {
      instance.destroy();
      setCalculator(undefined);
    };
  }, []);

  if (!calculator) {
    return null;
  }

  const { fps, maxFps } = calculator;
  return (
    <div className={classes.root}>
      <span>{fps[fps.length - 1]} FPS</span>
      <div className={classes.graph}>
        {fps.map((f, i) => {
          const height = (GRAPH_HEIGHT * f) / maxFps;
          return (
            <div
              key={`fps-${i}`}
              className={classes.bar}
              style={{ height, right: fps.length - 1 - i + "px" }}
            />
          );
        })}
      </div>
    </div>
  );
});
