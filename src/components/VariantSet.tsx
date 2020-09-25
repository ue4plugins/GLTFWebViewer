import React, { useState, useEffect, useCallback } from "react";
import { FormGroup, useTheme } from "@material-ui/core";
import { VariantSetManager, VariantSetState, VariantId } from "../variants";
import { Variant } from "./Variant";
import { Appear } from "./Appear";

export type VariantSetProps = {
  id: number;
  manager: VariantSetManager;
};

export const VariantSet: React.FC<VariantSetProps> = ({ id, manager }) => {
  const theme = useTheme();
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
    <FormGroup aria-label="variant-set" id={`variant-set-${id}`}>
      {variants &&
        variants.map(variantId => (
          <Variant
            key={variantId}
            appear={
              <Appear
                direction="left"
                delay={variantId * theme.listAnimationDelay}
              />
            }
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
