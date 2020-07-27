import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Button, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { observer } from "mobx-react-lite";
import {
  AnimationSelector,
  VariantSetList,
  GltfList,
  CameraSelector,
  InputGroup,
} from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  viewSingle: {
    overflow: "auto",
  },
  viewNone: {
    margin: theme.spacing(2),
  },
  backButton: {
    margin: theme.spacing(1.5, 1),
  },
  meta: {
    margin: theme.spacing(2, 2, 3, 2),
  },
}));

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const Gltf: React.FC<GltfProps> = observer(listProps => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { animations, configurator, gltfs, gltf, cameras } = gltfStore;
  const [view, setView] = useState<"list" | "single" | "none">("list");

  useEffect(() => {
    setView(gltf ? "single" : gltfs.length === 0 ? "none" : "list");
  }, [gltf, gltfs]);

  return (
    <div className={classes.root}>
      {view === "list" ? (
        <GltfList {...listProps} onSelect={() => setView("single")} />
      ) : view === "single" ? (
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
          <div className={classes.viewSingle}>
            <div className={classes.meta}>
              <Typography variant="h6">{gltf?.name}</Typography>
              {gltf?.creator && (
                <Typography variant="caption">
                  By{" "}
                  {gltf.creatorUrl ? (
                    <a
                      href={gltf.creatorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {gltf.creator}
                    </a>
                  ) : (
                    gltf.creator
                  )}
                </Typography>
              )}
            </div>
            {cameras.length > 1 && (
              <InputGroup>
                <CameraSelector />
              </InputGroup>
            )}
            {animations.length > 0 && (
              <InputGroup>
                <AnimationSelector />
              </InputGroup>
            )}
            {configurator && <VariantSetList />}
          </div>
        </>
      ) : (
        <Typography
          className={classes.viewNone}
          variant="body2"
          color="textSecondary"
        >
          Drag and drop a glTF file to start
        </Typography>
      )}
    </div>
  );
});
