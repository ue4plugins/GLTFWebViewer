import React from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => {
  const layerWidth = 18;
  const layerHeight = 2;
  const layerSpacing = 4;
  const borderRadius = 1;

  const layerStyles: React.CSSProperties = {
    display: "block",
    position: "absolute",
    width: layerWidth,
    height: layerHeight,
    backgroundColor: "currentColor",
    borderRadius: borderRadius,
    transition: theme.transitions.create(["transform", "opacity"], {
      duration: theme.transitions.duration.shorter,
    }),
  };

  return {
    root: {
      width: layerWidth,
      height: layerWidth,
    },
    wrapper: {
      position: "relative",
      width: layerWidth,
      marginTop: (layerWidth - (layerHeight * 3 + layerSpacing * 2)) / 2,
    },
    layer: {
      ...layerStyles,
      top: layerHeight / 2,
      marginTop: layerHeight / -2,
      "&::before": {
        ...layerStyles,
        top: layerSpacing + layerHeight,
        content: "''",
      },
      "&::after": {
        ...layerStyles,
        top: layerHeight * 2 + layerSpacing * 2,
        content: "''",
      },
    },
    layerActive: {
      transform: `translate3d(0, ${layerSpacing +
        layerHeight}px, 0) rotate(45deg)`,
      "&::before": {
        transform: `rotate(-45deg) translate3d(${layerWidth /
          -7}px, ${layerSpacing * -1}px, 0)`,
        opacity: 0,
      },
      "&::after": {
        transform: `translate3d(0, ${(layerSpacing + layerHeight) *
          -2}px, 0) rotate(-90deg)`,
      },
    },
  };
});

export type HamburgerProps = {
  active?: boolean;
};

export const Hamburger: React.FC<HamburgerProps> = ({ active }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <div
          className={clsx(classes.layer, {
            [classes.layerActive]: active,
          })}
        />
      </div>
    </div>
  );
};
