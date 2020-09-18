import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, IconButton } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    flex: `0 0 ${theme.topbarHeight}px`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: theme.palette.grey[700],
  },
  backButton: {
    marginLeft: -theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(1),
  },
  title: {},
  body: {
    flex: "1 1 auto",
    overflow: "auto",
  },
}));

export type SidebarContainerProps = {
  title?: string;
  onNavigateBack?: () => void;
};

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  title,
  onNavigateBack,
  children,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {onNavigateBack && (
          <IconButton
            className={classes.backButton}
            size="small"
            disableTouchRipple
            onClick={onNavigateBack}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography className={classes.title} variant="button">
          {title}
        </Typography>
      </div>
      <div className={classes.body}>{children}</div>
    </div>
  );
};
