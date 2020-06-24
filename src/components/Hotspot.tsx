import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useTheme, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    width: theme.hotspotSize,
    height: theme.hotspotSize,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    [theme.breakpoints.down("sm")]: {
      // TODO
    },
  },
  active: {
    backgroundColor: theme.palette.primary.dark,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    borderRadius: "50%",
  },
}));

export type HotspotProps = {
  x: number;
  y: number;
  imageSource: string;
  onToggle: (active: boolean) => void;
};

export const Hotspot: React.FC<HotspotProps> = ({
  x,
  y,
  imageSource,
  onToggle,
}) => {
  const classes = useStyles();
  const { hotspotSize } = useTheme();
  const [active, setActive] = useState(false);

  useEffect(() => onToggle(active), [active, onToggle]);

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
      style={{
        top: y - hotspotSize / 2,
        left: x - hotspotSize / 2,
      }}
      onClick={() => setActive(!active)}
    >
      <div className={classes.image} style={{ backgroundImage: imageSource }} />
    </div>
  );
};
