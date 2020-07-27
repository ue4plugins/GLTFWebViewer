import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Divider,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { observer } from "mobx-react-lite";
import { GltfList, Gltf } from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  spinner: {
    paddingTop: theme.spacing(2),
    textAlign: "center",
  },
  error: {
    margin: theme.spacing(2),
  },
  single: {
    overflow: "auto",
  },
  backButton: {
    margin: theme.spacing(1.5, 1),
  },
}));

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const GltfView: React.FC<GltfProps> = observer(
  ({ isLoading, isError }) => {
    const classes = useStyles();
    const { gltfStore } = useStores();
    const { gltfs, gltf } = gltfStore;
    const [view, setView] = useState<"list" | "single" | "none">("list");

    useEffect(() => {
      setView(gltf ? "single" : gltfs.length === 0 ? "none" : "list");
    }, [gltf, gltfs]);

    return (
      <div className={classes.root}>
        {isLoading ? (
          <div className={classes.spinner}>
            <CircularProgress />
          </div>
        ) : isError ? (
          <Typography
            className={classes.error}
            variant="body2"
            color="textSecondary"
          >
            Something went wrong when loading glTF files. Check console for more
            details.
          </Typography>
        ) : (
          (() => {
            switch (view) {
              case "list":
                return <GltfList onSelect={() => setView("single")} />;
              case "single":
                return (
                  <>
                    {gltfs.length > 1 && (
                      <>
                        <div className={classes.backButton}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => setView("list")}
                          >
                            Show all files
                          </Button>
                        </div>
                        <Divider />
                      </>
                    )}
                    <div className={classes.single}>
                      <Gltf />
                    </div>
                  </>
                );
              case "none":
                return (
                  <Typography
                    className={classes.error}
                    variant="body2"
                    color="textSecondary"
                  >
                    Drag and drop a glTF file to start
                  </Typography>
                );
            }
          })()
        )}
      </div>
    );
  },
);
