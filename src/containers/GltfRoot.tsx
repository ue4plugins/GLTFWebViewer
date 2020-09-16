import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { GltfList, Gltf, SidebarContainer } from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  loading: {
    paddingTop: theme.spacing(2),
    textAlign: "center",
  },
  text: {
    margin: theme.spacing(2),
  },
}));

export type GltfRootProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const GltfRoot: React.FC<GltfRootProps> = observer(
  ({ isLoading, isError }) => {
    const classes = useStyles();
    const { gltfStore } = useStores();
    const {
      gltfs,
      gltf,
      variantSetId,
      showVariantSet,
      variantSetManager,
    } = gltfStore;
    const [view, setView] = useState<
      "gltf-list" | "gltf" | "variant-set" | "none"
    >("gltf-list");

    const variantSet =
      variantSetManager && variantSetId !== undefined
        ? variantSetManager.variantSets[variantSetId]
        : undefined;

    useEffect(() => {
      setView(
        gltf
          ? variantSet
            ? "variant-set"
            : "gltf"
          : gltfs.length === 0
          ? "none"
          : "gltf-list",
      );
    }, [gltf, variantSet, gltfs]);

    if (isLoading) {
      return (
        <SidebarContainer>
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        </SidebarContainer>
      );
    }

    if (isError) {
      return (
        <SidebarContainer>
          <Typography
            className={classes.text}
            variant="body2"
            color="textSecondary"
          >
            Something went wrong when loading glTF files. Check console for more
            details.
          </Typography>
        </SidebarContainer>
      );
    }

    switch (view) {
      case "none":
        return (
          <SidebarContainer>
            <Typography
              className={classes.text}
              variant="body2"
              color="textSecondary"
            >
              Drag and drop a glTF file to start
            </Typography>
          </SidebarContainer>
        );
      case "gltf-list":
        return (
          <SidebarContainer title="Select file">
            <GltfList onSelect={() => setView("gltf")} />
          </SidebarContainer>
        );
      case "gltf":
        return (
          <SidebarContainer
            title={gltf?.name}
            onNavigateBack={
              gltfs.length > 1 ? () => setView("gltf-list") : undefined
            }
          >
            <Gltf />
          </SidebarContainer>
        );
      case "variant-set":
        return (
          <SidebarContainer
            title={variantSet?.name}
            onNavigateBack={() => showVariantSet(undefined)}
          >
            Variant set: {variantSetId}
          </SidebarContainer>
        );
    }
  },
);
