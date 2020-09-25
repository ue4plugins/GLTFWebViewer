import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Divider, useTheme } from "@material-ui/core";
import { VariantSet } from "../variants";
import { GltfSource } from "../types";
import { NavList } from "./NavList";
import { NavListItem } from "./NavListItem";
import { ErrorMessage } from "./ErrorMessage";
import { Appear } from "./Appear";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  variantSets: {
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
  variantSets: VariantSet[];
  appearDirection: "left" | "right";
  onVariantSetSelect: (id: number) => void;
};

export const GltfContent: React.FC<GltfContentProps> = ({
  gltf,
  variantSets,
  appearDirection,
  onVariantSetSelect,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.root}>
      <div className={classes.variantSets}>
        {variantSets.length > 0 ? (
          <NavList>
            {variantSets.map((variantSet, variantSetId) => (
              <NavListItem
                key={variantSetId}
                onClick={() => onVariantSetSelect(variantSetId)}
                appear={
                  <Appear
                    direction={appearDirection}
                    delay={
                      appearDirection === "left"
                        ? variantSetId * theme.listAnimationDelay
                        : (variantSets.length - 1 - variantSetId) *
                          theme.listAnimationDelay
                    }
                  />
                }
              >
                {variantSet.name}
              </NavListItem>
            ))}
          </NavList>
        ) : (
          <Appear duration={theme.transitions.duration.standard}>
            <ErrorMessage type="empty" overline="Empty" title="No options">
              This scene does not contain any configurable objects.
            </ErrorMessage>
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
    </div>
  );
};
