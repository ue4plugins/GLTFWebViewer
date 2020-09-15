import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, IconButton } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    height: theme.topbarHeight,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: theme.palette.grey["500"],
  },
  backButton: {
    marginLeft: -theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

export type SidebarHeaderProps = {
  title: string;
  navigateBack?: () => void;
};

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  navigateBack,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <IconButton
        className={classes.backButton}
        size="small"
        disableTouchRipple
        onClick={navigateBack}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="button">{title}</Typography>
    </div>
  );
};
