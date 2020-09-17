import React, { useState, useEffect, useCallback } from "react";
import { FormGroup } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { VariantSetManager, VariantSetState, VariantId } from "../variants";
import { Variant } from "./Variant";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
}));

export type VariantSetProps = {
  id: number;
  manager: VariantSetManager;
};

export const VariantSet: React.FC<VariantSetProps> = ({ id, manager }) => {
  const classes = useStyles();
  const [variantLabels, setVariantLabels] = useState<string[]>();
  const [variantImages, setVariantImages] = useState<(string | undefined)[]>();
  const [variants, setVariants] = useState<VariantId[]>();
  const [selectedVariants, setSelectedVariants] = useState<VariantSetState>();
  const [userSelectedVariant, setUserSelectedVariant] = useState<number>();

  const onSelectedVariantsChange = useCallback(setSelectedVariants, [
    setSelectedVariants,
  ]);
  const onUserSelectedVariantChange = useCallback(setUserSelectedVariant, [
    setUserSelectedVariant,
  ]);

  useEffect(() => {
    setVariants(manager.getVariantIds(id));
    setVariantLabels(manager.getVariantNames(id));
    setVariantImages(manager.getVariantThumbnails(id));
    setSelectedVariants(manager.getState(id));

    return () => {
      setVariants(undefined);
      setVariantLabels(undefined);
      setVariantImages(undefined);
      setSelectedVariants(undefined);
    };
  }, [manager, id]);

  useEffect(() => {
    manager.onStateChange(id, onSelectedVariantsChange);

    return () => {
      manager.offStateChange(id, onSelectedVariantsChange);
    };
  }, [manager, id, onSelectedVariantsChange]);

  useEffect(() => {
    if (userSelectedVariant !== undefined) {
      manager.activate(id, userSelectedVariant);
    }
  }, [manager, id, userSelectedVariant]);

  return (
    <FormGroup
      className={classes.root}
      aria-label="variant-set"
      id={`variant-set-${id}`}
    >
      {variants &&
        variants.map(variantId => (
          <Variant
            key={variantId}
            checked={selectedVariants?.some(
              selectedVariantId => selectedVariantId === variantId,
            )}
            value={variantId}
            label={variantLabels?.[variantId] ?? ""}
            image={variantImages?.[variantId]}
            onChange={e => onUserSelectedVariantChange(Number(e.target.value))}
          />
        ))}
    </FormGroup>
  );
};
