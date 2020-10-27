import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Divider, useTheme } from "@material-ui/core";
import { VariantSetManager } from "../variants";
import { GltfSource } from "../types";
import { NavList } from "./NavList";
import { NavListItem } from "./NavListItem";
import { MessageBox } from "./MessageBox";
import { Appear } from "./Appear";
import { LevelVariantSet } from "./LevelVariantSet";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  variantSets: {
    overflow: "auto",
  },
  levelVariantSets: {
    flex: "1 1 auto",
    padding: theme.spacing(2, 3),
    overflow: "auto",
  },
  meta: {
    flex: "0 0 auto",
    padding: theme.spacing(3),
    "& a": {
      color: theme.palette.common.white,
    },
    "& p:not(:last-of-type)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export type GltfContentProps = {
  gltf: GltfSource;
  appearDirection: "left" | "right";
  variantSetManager?: VariantSetManager;
  onLevelVariantSetSelect: (id: number) => void;
};

export const GltfContent: React.FC<GltfContentProps> = ({
  gltf,
  variantSetManager,
  appearDirection,
  onLevelVariantSetSelect,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const levelVariantSets = variantSetManager?.levelVariantSets ?? [];

  return (
    <div className={classes.root}>
      {variantSetManager && levelVariantSets.length === 1 ? (
        <div className={classes.variantSets}>
          <LevelVariantSet
            variantSets={levelVariantSets[0].variantSets}
            manager={variantSetManager}
          />
        </div>
      ) : (
        <>
          <div className={classes.levelVariantSets}>
            {variantSetManager && levelVariantSets.length > 0 ? (
              <NavList>
                {levelVariantSets.map((levelVariantSet, levelVariantSetId) => (
                  <NavListItem
                    key={levelVariantSetId}
                    onClick={() => onLevelVariantSetSelect(levelVariantSetId)}
                    appear={
                      <Appear
                        direction={appearDirection}
                        delay={
                          appearDirection === "left"
                            ? levelVariantSetId * theme.listAnimationDelay
                            : (levelVariantSets.length -
                                1 -
                                levelVariantSetId) *
                              theme.listAnimationDelay
                        }
                      />
                    }
                  >
                    {levelVariantSet.name}
                  </NavListItem>
                ))}
              </NavList>
            ) : (
              <Appear duration={theme.transitions.duration.standard}>
                <MessageBox icon="empty" overline="Empty" title="No options">
                  This scene does not contain any configurable objects.
                </MessageBox>
              </Appear>
            )}
          </div>
          {(gltf.description || gltf.creator) && (
            <Appear direction="up">
              <Divider />
              <div className={classes.meta}>
                {gltf.description && (
                  <>
                    <Typography variant="overline" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body2">{gltf.description}</Typography>
                  </>
                )}
                {gltf.creator && (
                  <>
                    <Typography variant="overline" color="textSecondary">
                      Creator
                    </Typography>
                    <Typography variant="body2">
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
                  </>
                )}
              </div>
            </Appear>
          )}
        </>
      )}
    </div>
  );
};
