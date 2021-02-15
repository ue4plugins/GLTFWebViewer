import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles, ButtonBase } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    width: 42,
    height: 42,
    transform: "translateX(-50%) translateY(-50%)",
    padding: theme.spacing(0.5),
    borderRadius: "50%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.common.white,
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[6],
    opacity: 0.8,
    transition: theme.transitions.create(["background-color", "opacity"], {
      duration: theme.transitions.duration.standard,
    }),
    "&:hover": {
      opacity: 1,
    },
  },
  active: {
    backgroundColor: theme.palette.primary.light,
    opacity: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.common.white,
    borderRadius: "50%",
    backgroundSize: "cover",
    transition: theme.transitions.create(["background"], {
      duration: theme.transitions.duration.standard,
    }),
  },
}));

export type HotspotProps = {
  imageSource: string;
  toggledImageSource?: string;
  toggled?: boolean;
  onToggle: (active: boolean) => void;
};

export const Hotspot: React.FC<HotspotProps> = ({
  imageSource,
  toggledImageSource,
  toggled: toggledProp,
  onToggle,
}) => {
  const classes = useStyles();
  const [toggled, setToggled] = useState(toggledProp ?? false);
  const image =
    toggled && toggledImageSource ? toggledImageSource : imageSource;

  return (
    <ButtonBase
      className={clsx(classes.root, {
        [classes.active]: toggled,
      })}
      aria-label="hotspot"
      disableRipple
      onClick={() => {
        setToggled(!toggled);
        onToggle(!toggled);
      }}
    >
      <div
        className={classes.image}
        style={{ backgroundImage: `url(${image})` }}
      />
    </ButtonBase>
  );
};
