import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react-lite";

const GRAPH_HEIGHT = 39;
const GRAPH_WIDTH = 250;
const FONT_SIZE = 14;

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 999999,
    position: "fixed",
    height: GRAPH_HEIGHT + 9 + FONT_SIZE + "px",
    width: GRAPH_WIDTH + 6 + "px",
    padding: "3px",
    backgroundColor: "#000",
    color: "#f3f3f3",
    fontSize: FONT_SIZE + "px",
    lineHeight: FONT_SIZE + 1 + "px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "bold",
    MozBoxSizing: "border-box",
    boxSizing: "border-box",
    pointerEvents: "none",
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

const barColors = [
  "#F44336",
  "#FF9800",
  "#FFC107",
  "#FFEB3B",
  "#CDDC39",
  "#8BC34A",
  "#4CAF50",
];

class FpsCalculator {
  @observable public fps: Array<number> = [];
  private prevTime = performance.now();
  private frames = 0;
  private req = 0;

  public constructor() {
    this.start();
  }

  @computed public get lastFps() {
    return this.fps[this.fps.length - 1] || 0;
  }

  @computed public get maxFps() {
    return Math.min(60, Math.max.apply(Math.max, this.fps));
  }

  @computed public get minFps() {
    return Math.max(0, Math.min.apply(Math.min, this.fps));
  }

  @computed public get avgFps() {
    return Math.round(
      this.fps.reduce((acc, cur) => acc + cur, 0) / this.fps.length,
    );
  }

  @action
  private calc(currentTime: number) {
    const { prevTime } = this;
    const nextFrames = this.frames + 1;
    this.frames = nextFrames;
    if (currentTime > prevTime + 50) {
      let nextFps = Math.round((nextFrames * 1000) / (currentTime - prevTime));
      if (nextFps > 60) {
        nextFps = 60;
      }
      const fps = [...this.fps, nextFps];
      this.fps = fps.length > GRAPH_WIDTH ? fps.slice(1, GRAPH_WIDTH + 1) : fps;
      this.prevTime = currentTime;
      this.frames = 0;
    }
    this.start();
  }

  public start() {
    this.req = requestAnimationFrame(this.calc.bind(this));
  }

  public stop() {
    cancelAnimationFrame(this.req);
  }
}

interface Props {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
}

export const FpsMonitor: React.FC<Props> = observer(props => {
  const classes = useStyles();
  const [calculator, setCalculator] = useState<FpsCalculator>();

  useEffect(() => {
    const instance = new FpsCalculator();
    setCalculator(instance);
    return () => {
      instance.stop();
      setCalculator(undefined);
    };
  }, []);

  if (!calculator) {
    return null;
  }

  const { fps, lastFps, avgFps, minFps, maxFps } = calculator;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...posStyle } = props;
  return (
    <div className={classes.root} style={posStyle}>
      <span>
        FPS: {lastFps} MIN: {minFps} AVG: {avgFps} MAX: {maxFps}
      </span>
      <div className={classes.graph}>
        {fps.map((f, i) => {
          const height = (GRAPH_HEIGHT * f) / 60;
          const backgroundColor = barColors[Math.floor(f / 10)];
          const right = fps.length - 1 - i + "px";
          return (
            <div
              key={`fps-${i}`}
              className={classes.bar}
              style={{ backgroundColor, height, right }}
            />
          );
        })}
      </div>
    </div>
  );
});
