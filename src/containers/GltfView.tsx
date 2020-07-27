import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Button, Typography } from "@material-ui/core";
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
  single: {
    overflow: "auto",
  },
  none: {
    margin: theme.spacing(2),
  },
  backButton: {
    margin: theme.spacing(1.5, 1),
  },
}));

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const GltfView: React.FC<GltfProps> = observer(listProps => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { gltfs, gltf } = gltfStore;
  const [view, setView] = useState<"list" | "single" | "none">("list");

  useEffect(() => {
    setView(gltf ? "single" : gltfs.length === 0 ? "none" : "list");
  }, [gltf, gltfs]);

  return (
    <div className={classes.root}>
      {(() => {
        switch (view) {
          case "list":
            return (
              <GltfList {...listProps} onSelect={() => setView("single")} />
            );
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
                className={classes.none}
                variant="body2"
                color="textSecondary"
              >
                Drag and drop a glTF file to start
              </Typography>
            );
        }
      })()}
    </div>
  );
});
