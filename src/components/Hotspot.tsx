import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    width: theme.hotspotSize,
    height: theme.hotspotSize,
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.light,
    transform: "translateX(-50%) translateY(-50%)",
    borderRadius: "50%",
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
  imageSource: string;
  onToggle: (active: boolean) => void;
};

export const Hotspot: React.FC<HotspotProps> = ({ imageSource, onToggle }) => {
  const classes = useStyles();
  const [active, setActive] = useState(false);

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
      onClick={() => {
        setActive(!active);
        onToggle(!active);
      }}
    >
      <div
        className={classes.image}
        style={{ backgroundImage: `url(${imageSource})` }}
      />
    </div>
  );
};
