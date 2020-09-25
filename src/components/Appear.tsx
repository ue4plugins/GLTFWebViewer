import React, { ReactNode } from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => {
  const offset = "100px";
  const to = { opacity: 1, transform: "translate3d(0, 0, 0)" };
  return {
    "@keyframes default": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    "@keyframes slideInLeft": {
      from: { opacity: 0, transform: `translate3d(${offset}, 0, 0)` },
      to,
    },
    "@keyframes slideInRight": {
      from: { opacity: 0, transform: `translate3d(-${offset}, 0, 0)` },
      to,
    },
    "@keyframes slideInUp": {
      from: { opacity: 0, transform: `translate3d(0, ${offset}, 0)` },
      to,
    },
    "@keyframes slideInDown": {
      from: { opacity: 0, transform: `translate3d(0, -${offset}, 0)` },
      to,
    },
    root: {
      opacity: 0,
      animationName: "$default",
      animationFillMode: "forwards",
      animationTimingFunction: theme.transitions.easing.easeOut,
      animationDuration: `${theme.transitions.duration.enteringScreen}ms`,
    },
    left: {
      animationName: "$slideInLeft",
    },
    right: {
      animationName: "$slideInRight",
    },
    up: {
      animationName: "$slideInUp",
    },
    down: {
      animationName: "$slideInDown",
    },
  };
});

export type AppearProps = {
  children?: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
};

export const Appear: React.FC<AppearProps> = ({
  children,
  direction,
  duration,
  delay,
}) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, {
        [classes.left]: direction === "left",
        [classes.right]: direction === "right",
        [classes.up]: direction === "up",
        [classes.down]: direction === "down",
      })}
      style={{
        animationDuration: duration ? `${duration}ms` : undefined,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
};
