import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, IconButton } from "@material-ui/core";
import { Appear } from "./Appear";
import { Arrow } from "./Arrow";

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
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    backgroundColor: theme.palette.grey[700],
  },
  backButtonWrapper: {
    display: "flex",
    alignItems: "center",
    marginLeft: -theme.spacing(3),
    marginRight: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    height: "100%",
    backgroundColor: theme.palette.grey[700],
    zIndex: 1,
  },
  backButton: {
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
  appearDirection?: "left" | "right";
  onNavigateBack?: () => void;
};

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  title,
  appearDirection = "left",
  onNavigateBack,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {onNavigateBack && (
          <div className={classes.backButtonWrapper}>
            <IconButton
              className={classes.backButton}
              size="small"
              disableTouchRipple
              onClick={onNavigateBack}
            >
              <Arrow />
            </IconButton>
          </div>
        )}
        <Typography className={classes.title} variant="button">
          <Appear key={title} direction={appearDirection}>
            {title}
          </Appear>
        </Typography>
      </div>
      <div className={classes.body}>{children}</div>
    </div>
  );
};
