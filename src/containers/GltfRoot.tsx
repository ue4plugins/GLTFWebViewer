import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import {
  Gltf,
  SidebarContainer,
  VariantSet as VariantSetComponent,
  NavList,
  NavListItem,
} from "../components";
import { useStores } from "../stores";
import { VariantSet } from "../variants";

const useStyles = makeStyles(theme => ({
  loading: {
    paddingTop: theme.spacing(2),
    textAlign: "center",
  },
  content: {
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
      gltf: selectedGltf,
      variantSetId: selectedVariantSetId,
      variantSetManager,
      showVariantSet,
      setGltf,
    } = gltfStore;
    const [view, setView] = useState<
      "gltf-list" | "gltf" | "variant-set" | "none"
    >("gltf-list");
    const [variantSets, setVariantSets] = useState<VariantSet[]>([]);

    const variantSet =
      selectedVariantSetId !== undefined
        ? variantSets[selectedVariantSetId]
        : undefined;

    useEffect(() => {
      if (variantSetManager) {
        setVariantSets(variantSetManager.variantSets);
      }

      return () => {
        setVariantSets([]);
      };
    }, [variantSetManager]);

    useEffect(() => {
      setView(
        selectedGltf
          ? variantSet
            ? "variant-set"
            : "gltf"
          : gltfs.length === 0
          ? "none"
          : "gltf-list",
      );
    }, [selectedGltf, variantSet, gltfs]);

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
            className={classes.content}
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
              className={classes.content}
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
            <div className={classes.content}>
              <NavList>
                {gltfs.map(gltf => (
                  <NavListItem
                    key={gltf.filePath}
                    onClick={() => {
                      setGltf(gltf);
                      setView("gltf");
                    }}
                    selected={
                      selectedGltf && gltf.filePath === selectedGltf.filePath
                    }
                  >
                    {gltf.name}
                  </NavListItem>
                ))}
              </NavList>
            </div>
          </SidebarContainer>
        );
      case "gltf":
        if (!selectedGltf) {
          return null;
        }
        return (
          <SidebarContainer
            title={selectedGltf?.name}
            onNavigateBack={
              gltfs.length > 1 ? () => setView("gltf-list") : undefined
            }
          >
            <Gltf
              gltf={selectedGltf}
              variantSets={variantSets}
              onVariantSetSelect={showVariantSet}
            />
          </SidebarContainer>
        );
      case "variant-set":
        if (selectedVariantSetId === undefined || !variantSetManager) {
          return null;
        }
        return (
          <SidebarContainer
            title={variantSet?.name}
            onNavigateBack={() => showVariantSet(undefined)}
          >
            <VariantSetComponent
              id={selectedVariantSetId}
              manager={variantSetManager}
            />
          </SidebarContainer>
        );
    }
  },
);
