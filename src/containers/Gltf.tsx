import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Button, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import {
  AnimationSelector,
  VariantSetList,
  GltfList,
  CameraSelector,
} from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sectionSingle: {
    overflow: "auto",
  },
  sectionNone: {
    margin: theme.spacing(2),
  },
  backButton: {},
}));

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const Gltf: React.FC<GltfProps> = observer(listProps => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { animations, configurator, gltfs, gltf, cameras } = gltfStore;
  const [section, setSection] = useState<"list" | "single" | "none">("list");

  useEffect(() => {
    setSection(gltf ? "single" : gltfs.length === 0 ? "none" : "list");
  }, [gltf, gltfs]);

  return (
    <div className={classes.root}>
      {section === "list" ? (
        <GltfList {...listProps} onSelect={() => setSection("single")} />
      ) : section === "single" ? (
        <>
          {gltfs.length > 1 && (
            <div className={classes.backButton}>
              <Button onClick={() => setSection("list")}>Show all</Button>
            </div>
          )}
          <div className={classes.sectionSingle}>
            {cameras.length > 1 && (
              <>
                <CameraSelector />
                <Divider />
              </>
            )}

            {animations.length > 0 && (
              <>
                <AnimationSelector />
                <Divider />
              </>
            )}
            {configurator && (
              <>
                <VariantSetList />
                <Divider />
              </>
            )}
          </div>
        </>
      ) : (
        <Typography
          className={classes.sectionNone}
          variant="body2"
          color="textSecondary"
        >
          Drag and drop a glTF file to start
        </Typography>
      )}
    </div>
  );
});
