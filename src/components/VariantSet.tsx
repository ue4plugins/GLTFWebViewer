import React, { useCallback } from "react";
import {
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FieldInputProps } from "./Field";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1, 2),
    minWidth: 120,
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
  // domainImages,
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
    <FormControl className={classes.formControl}>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup name={`variant-${id}`} value={value} onChange={onChange}>
        {domain &&
          domain.map((domainValue, domainValueIndex) => (
            <FormControlLabel
              key={domainValue}
              value={domainValue}
              label={domainLabels[domainValueIndex]}
              control={<Radio />}
            />
          ))}
      </RadioGroup>
    </FormControl>
  );
};
