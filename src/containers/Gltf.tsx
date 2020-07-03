import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { AnimationSelector, VariantSetList, GltfList } from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(_theme => ({
  root: {},
}));

export type GltfProps = {
  isLoading?: boolean;
  isError?: boolean;
};

export const Gltf: React.FC<GltfProps> = observer(listProps => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { animations, configurator, gltfs } = gltfStore;
  const [showSingle, setShowSingle] = useState(false);

  const showList = gltfs.length > 1 && !showSingle;

  return (
    <div className={classes.root}>
      {showList ? (
        <GltfList {...listProps} onSelect={() => setShowSingle(true)} />
      ) : (
        <>
          <div>
            <Button onClick={() => setShowSingle(false)}>Go back</Button>
          </div>
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
        </>
      )}
    </div>
  );
});
