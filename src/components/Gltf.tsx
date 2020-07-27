import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import {
  AnimationSelector,
  VariantSetList,
  CameraSelector,
  InputGroup,
} from ".";

const useStyles = makeStyles(theme => ({
  meta: {
    margin: theme.spacing(2, 2, 3, 2),
  },
}));

export const Gltf: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { animations, configurator, gltf, cameras } = gltfStore;

  if (!gltf) {
    return null;
  }

  return (
    <>
      <div className={classes.meta}>
        <Typography variant="h6">{gltf?.name}</Typography>
        {gltf.description && (
          <Typography variant="caption" component="div">
            Description: {gltf.description}
          </Typography>
        )}
        {gltf.creator && (
          <Typography variant="caption" component="div">
            Creator:{" "}
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
    </>
  );
});
