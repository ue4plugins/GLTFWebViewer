import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react-lite";

const graphHeight = 40;
const graphWidth = 250;
const barColors = [
  "#F44336",
  "#FF9800",
  "#FFC107",
  "#FFEB3B",
  "#CDDC39",
  "#8BC34A",
  "#4CAF50",
];

const useStyles = makeStyles(theme => {
  const { fontSize, fontWeightBold: fontWeight } = theme.typography;
  const internalSpacing = theme.spacing(0.5);
  const externalSpacing = theme.spacing(2);
  const backgroundColor = theme.palette.common.black;
  return {
    root: {
      zIndex: 2,
      position: "absolute",
      top: externalSpacing,
      left: externalSpacing,
      height: graphHeight + fontSize + internalSpacing * 3,
      width: graphWidth + internalSpacing * 2,
      padding: internalSpacing,
      backgroundColor: backgroundColor,
      color: theme.palette.getContrastText(backgroundColor),
      fontSize: fontSize,
      lineHeight: 1,
      fontWeight: fontWeight,
      MozBoxSizing: "border-box",
      boxSizing: "border-box",
      pointerEvents: "none",
    },
    graph: {
      position: "absolute",
      left: internalSpacing,
      right: internalSpacing,
      bottom: internalSpacing,
      height: graphHeight,
      backgroundColor: "#282844",
      MozBoxSizing: "border-box",
      boxSizing: "border-box",
    },
    bar: {
      position: "absolute",
      bottom: 0,
      width: 1,
      boxSizing: "border-box",
    },
  };
});

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
      this.fps = fps.length > graphWidth ? fps.slice(1, graphWidth + 1) : fps;
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

export const FpsMonitor: React.FC = observer(() => {
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

  return (
    <div className={classes.root}>
      <span>
        FPS: {lastFps} MIN: {minFps} AVG: {avgFps} MAX: {maxFps}
      </span>
      <div className={classes.graph}>
        {fps.map((f, i) => {
          const height = (graphHeight * f) / 60;
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
