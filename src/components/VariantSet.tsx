import React, { useCallback } from "react";
import { RadioGroup, FormControl, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FieldInputProps } from "./Field";
import { Variant } from "./Variant";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    marginBottom: theme.spacing(1),
  },
  label: {
    margin: theme.spacing(1, 2),
  },
}));

export type VariantSetProps = FieldInputProps & {
  label: string;
  domainLabels: string[];
  domainImages: (string | undefined)[];
};

export const VariantSet: React.FC<VariantSetProps> = ({
  id,
  label,
  value = 0,
  domain,
  domainLabels,
  domainImages,
  onValueChange,
}) => {
  const classes = useStyles();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange(Number(e.target.value));
      }
    },
    [onValueChange],
  );

  return (
    <FormControl className={classes.root}>
      <Typography
        className={classes.label}
        variant="caption"
        color="textSecondary"
      >
        {label}
      </Typography>
      <RadioGroup name={`variant-${id}`} value={value} onChange={onChange}>
        {domain &&
          domain.map((domainValue, domainValueIndex) => (
            <Variant
              key={domainValue}
              value={domainValue}
              label={domainLabels[domainValueIndex]}
              image={domainImages[domainValueIndex]}
            />
          ))}
      </RadioGroup>
    </FormControl>
  );
};
