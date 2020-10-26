import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, useTheme } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import {
  GltfContent,
  SidebarContainer,
  NavList,
  NavListItem,
  MessageBox,
  Appear,
} from "../components";
import { useStores } from "../stores";
import { LevelVariantSetWithIndices } from "../variants";
import { LevelVariantSet } from "../components/LevelVariantSet";

const useStyles = makeStyles(theme => ({
  loading: {
    paddingTop: theme.spacing(10),
    textAlign: "center",
  },
  content: {
    padding: theme.spacing(2, 3),
  },
}));

type View = "gltf-list" | "gltf-content" | "variant-set" | "none";

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const Gltf: React.FC<GltfProps> = observer(({ isLoading, isError }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { gltfStore } = useStores();
  const {
    gltfs,
    gltf: selectedGltf,
    levelVariantSetId: selectedLevelVariantSetId,
    variantSetManager,
    sceneHierarchy,
    showVariantSet,
    setGltf,
  } = gltfStore;
  const [view, setView] = useState<View>("gltf-list");
  const previousViewRef = useRef<View | undefined>();
  const [levelVariantSets, setLevelVariantSets] = useState<
    LevelVariantSetWithIndices[]
  >([]);

  const levelVariantSet =
    selectedLevelVariantSetId !== undefined
      ? levelVariantSets[selectedLevelVariantSetId]
      : undefined;

  let appearDirection: "left" | "right" = "left";

  useEffect(() => {
    if (variantSetManager) {
      setLevelVariantSets(variantSetManager.levelVariantSets);
    }

    return () => {
      setLevelVariantSets([]);
    };
  }, [variantSetManager]);

  useEffect(() => {
    previousViewRef.current = view;
  });

  useEffect(() => {
    setView(
      selectedGltf
        ? levelVariantSet
          ? "variant-set"
          : "gltf-content"
        : gltfs.length === 0
        ? "none"
        : "gltf-list",
    );
  }, [selectedGltf, levelVariantSet, gltfs]);

  const Loading: React.FC = () => (
    <div className={classes.loading}>
      <Appear>
        <CircularProgress />
      </Appear>
    </div>
  );

  if (isLoading) {
    return (
      <SidebarContainer>
        <Loading />
      </SidebarContainer>
    );
  }

  if (isError) {
    return <SidebarContainer></SidebarContainer>;
  }

  switch (view) {
    case "none":
      return (
        <SidebarContainer>
          <div className={classes.content}>
            <Appear duration={theme.transitions.duration.standard}>
              <MessageBox icon="empty" overline="Empty" title="No options">
                This scene does not contain any configurable objects.
              </MessageBox>
            </Appear>
          </div>
        </SidebarContainer>
      );
    case "gltf-list":
      appearDirection =
        previousViewRef.current === "gltf-content" ? "right" : "left";
      return (
        <SidebarContainer
          title="Select scene"
          appearDirection={appearDirection}
        >
          <div className={classes.content} data-testid="gltf-list">
            <NavList>
              {gltfs.map((gltf, index) => (
                <NavListItem
                  key={gltf.filePath}
                  onClick={() => {
                    setGltf(gltf);
                    setView("gltf-content");
                  }}
                  selected={
                    selectedGltf && gltf.filePath === selectedGltf.filePath
                  }
                  appear={
                    <Appear
                      direction={appearDirection}
                      delay={
                        appearDirection === "left"
                          ? index * theme.listAnimationDelay
                          : (gltfs.length - 1 - index) *
                            theme.listAnimationDelay
                      }
                    />
                  }
                >
                  {gltf.name}
                </NavListItem>
              ))}
            </NavList>
          </div>
        </SidebarContainer>
      );
    case "gltf-content":
      appearDirection =
        previousViewRef.current === "variant-set" ? "right" : "left";
      if (!selectedGltf) {
        return null;
      }
      return (
        <SidebarContainer
          title={selectedGltf?.name}
          appearDirection={appearDirection}
          onNavigateBack={
            gltfs.length > 1 ? () => setView("gltf-list") : undefined
          }
        >
          {sceneHierarchy ? (
            <GltfContent
              gltf={selectedGltf}
              levelVariantSets={levelVariantSets}
              appearDirection={appearDirection}
              onLevelVariantSetSelect={showVariantSet}
            />
          ) : (
            <Loading />
          )}
        </SidebarContainer>
      );
    case "variant-set":
      if (selectedLevelVariantSetId === undefined || !variantSetManager) {
        return null;
      }
      return (
        <SidebarContainer
          title={levelVariantSet?.name}
          onNavigateBack={() => showVariantSet(undefined)}
        >
          <LevelVariantSet
            variantSets={levelVariantSet?.variantSets ?? []}
            manager={variantSetManager}
          />
        </SidebarContainer>
      );
  }
});
