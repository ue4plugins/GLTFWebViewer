import React from "react";
import { makeStyles, useRadioGroup, Typography } from "@material-ui/core";
import clsx from "clsx";
import { red } from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
  input: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  button: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.common.white,
    boxShadow: `0 0 0 1px ${theme.palette.grey[500]} inset`,
    cursor: "pointer",
  },
  buttonChecked: {
    boxShadow: `0 0 0 2px ${theme.palette.primary.main} inset`,
  },
  image: {
    marginRight: theme.spacing(2),
    height: 46,
    width: 46,
    borderRadius: theme.shape.borderRadius,
    objectFit: "cover",
  },
  label: {},
  checkbox: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "red",
  },
  checkboxChecked: {},
}));

export type VariantProps = {
  autoFocus?: boolean;
  checked?: boolean;
  id?: string;
  image?: string;
  label: string;
  name?: string;
  tabIndex?: number;
  value?: string | number | string[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Variant: React.FC<VariantProps> = ({
  autoFocus,
  checked: checkedProp,
  id,
  image,
  label,
  name: nameProp,
  tabIndex,
  value,
  onChange,
}) => {
  const classes = useStyles();
  const radioGroup = useRadioGroup();

  const checked =
    typeof checkedProp === "undefined"
      ? radioGroup?.value === value
      : checkedProp;
  const name = typeof nameProp === "undefined" ? radioGroup?.name : nameProp;

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (radioGroup?.onChange) {
      radioGroup.onChange(e, e.target.value);
    }
  };

  return (
    <label>
      <input
        autoFocus={autoFocus}
        checked={checked}
        className={classes.input}
        id={id}
        name={name}
        onChange={_onChange}
        tabIndex={tabIndex}
        type="radio"
        value={value}
      />
      <div
        className={clsx(classes.button, {
          [classes.buttonChecked]: checked,
        })}
      >
        {image && <img className={classes.image} src={image} />}
        <Typography className={classes.label} component="div" variant="body2">
          {label}
        </Typography>
        <div
          className={clsx(classes.checkbox, {
            [classes.checkboxChecked]: checked,
          })}
        >
          a
        </div>
      </div>
    </label>
  );
};
