import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => {
  const size = 18;
  const baseLayerWidth = 16;
  const angleLayerWidth = 10;
  const layerHeight = 2;
  const borderRadius = 1;

  const layerStyles: React.CSSProperties = {
    display: "block",
    position: "absolute",
    width: baseLayerWidth,
    height: layerHeight,
    backgroundColor: "currentColor",
    borderRadius: borderRadius,
    animationFillMode: "forwards",
    animationTimingFunction: theme.transitions.easing.easeOut,
    animationDuration: `${theme.transitions.duration.shorter}ms`,
  };

  return {
    "@keyframes beforeLayerEnter": {
      from: {
        transform: `translate3d(0, 0, 0) rotate(0deg)`,
      },
      to: {
        transform: `translate3d(${angleLayerWidth * -0.2}px, ${angleLayerWidth *
          -0.28}px, 0) rotate(-45deg)`,
      },
    },
    "@keyframes afterLayerEnter": {
      from: {
        transform: `translate3d(0, 0, 0) rotate(0deg)`,
      },
      to: {
        transform: `translate3d(${angleLayerWidth * -0.2}px, ${angleLayerWidth *
          0.28}px, 0) rotate(45deg)`,
      },
    },
    root: {
      width: size,
      height: size,
    },
    wrapper: {
      position: "relative",
      width: size,
      marginTop: size / 2 - layerHeight / 2,
      marginLeft: layerHeight,
    },
    layer: {
      ...layerStyles,
      top: "50%",
      marginTop: layerHeight / -2,
      "&::before": {
        ...layerStyles,
        top: 0,
        width: angleLayerWidth,
        animationName: "$beforeLayerEnter",
        content: "''",
      },
      "&::after": {
        ...layerStyles,
        bottom: 0,
        width: angleLayerWidth,
        animationName: "$afterLayerEnter",
        content: "''",
      },
    },
  };
});

export const Arrow: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <div className={classes.layer} />
      </div>
    </div>
  );
};
