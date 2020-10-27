import React, { useState, useEffect, useCallback } from "react";
import {
  FormGroup,
  makeStyles,
  useTheme,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import { VariantSetManager, VariantSetState, VariantId } from "../variants";
import { Variant } from "./Variant";
import { Appear } from "./Appear";

const useStyles = makeStyles(theme => {
  return {
    root: {
      padding: theme.spacing(3),
      "&:not(:last-child)": {
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    label: {
      marginBottom: theme.spacing(1.5),
      fontSize: theme.typography.pxToRem(14),
      fontWeight: theme.typography.fontWeightMedium,
      textTransform: "uppercase",
    },
  };
});

export type VariantSetProps = {
  id: number;
  variantIdOffset?: number;
  manager: VariantSetManager;
};

export const VariantSet: React.FC<VariantSetProps> = ({
  id,
  variantIdOffset = 0,
  manager,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [label, setLabel] = useState<string>();
  const [variantLabels, setVariantLabels] = useState<string[]>();
  const [variantImages, setVariantImages] = useState<(string | undefined)[]>();
  const [variants, setVariants] = useState<VariantId[]>();
  const [selectedVariants, setSelectedVariants] = useState<VariantSetState>();

  const onSelectedVariantsChange = useCallback(setSelectedVariants, [
    setSelectedVariants,
  ]);
  const onVariantClicked = useCallback(
    (variantID: number) => {
      manager.activate(id, variantID);
    },
    [manager, id],
  );

  useEffect(() => {
    setLabel(manager.getName(id));
    setVariants(manager.getVariantIds(id));
    setVariantLabels(manager.getVariantNames(id));
    setVariantImages(manager.getVariantThumbnails(id));
    setSelectedVariants(manager.getState(id));

    return () => {
      setLabel(undefined);
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

  return (
    <FormControl fullWidth className={classes.root}>
      <Appear
        direction="left"
        delay={variantIdOffset * theme.listAnimationDelay}
      >
        <FormLabel component="legend" className={classes.label}>
          {label}
        </FormLabel>
      </Appear>
      <FormGroup aria-label="variant-set" id={`variant-set-${id}`}>
        {variants &&
          variants.map(variantId => (
            <Variant
              key={variantId}
              appear={
                <Appear
                  direction="left"
                  delay={
                    (variantIdOffset + variantId) * theme.listAnimationDelay
                  }
                />
              }
              checked={selectedVariants?.some(
                selectedVariantId => selectedVariantId === variantId,
              )}
              value={variantId}
              label={variantLabels?.[variantId] ?? ""}
              image={variantImages?.[variantId]}
              onClick={() => onVariantClicked(variantId)}
            />
          ))}
      </FormGroup>
    </FormControl>
  );
};
