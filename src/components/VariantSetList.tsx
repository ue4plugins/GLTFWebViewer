import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { makeStyles, FormLabel } from "@material-ui/core";
import { useStores } from "../stores";
import { VariantSet } from "../variants";
import { VariantSet as VariantSetComponent } from "./VariantSet";

const useStyles = makeStyles(theme => ({
  label: {
    margin: theme.spacing(2, 2, 1, 2),
  },
}));

export const VariantSetList: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { variantSetManager: manager } = gltfStore;
  const [variantSets, setVariantSets] = useState<VariantSet[]>([]);

  useEffect(() => {
    if (manager) {
      setVariantSets(manager.variantSets);
    }

    return () => {
      setVariantSets([]);
    };
  }, [manager]);

  if (!manager) {
    return null;
  }

  return (
    <>
      <FormLabel className={classes.label} component="legend">
        Variant sets
      </FormLabel>
      {variantSets.map((_, variantSetId) => (
        <VariantSetComponent
          key={variantSetId}
          id={variantSetId}
          manager={manager}
        />
      ))}
    </>
  );
});
