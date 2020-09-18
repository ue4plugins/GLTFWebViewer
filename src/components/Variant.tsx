import React from "react";
import { makeStyles, useRadioGroup, Typography } from "@material-ui/core";
import clsx from "clsx";
import { Check } from "@material-ui/icons";
import { mixColor } from "../utilities";

const useStyles = makeStyles(theme => {
  const backgroundColor = theme.palette.grey[700];
  const borderColor = theme.palette.grey[500];
  const checkColor = mixColor(theme.palette.common.white, borderColor, 0.2);

  const hoverBackgroundColor = mixColor(
    theme.palette.primary.main,
    backgroundColor,
    0.2,
  );
  const hoverBorderColor = mixColor(
    theme.palette.primary.main,
    backgroundColor,
    0.4,
  );
  const hoverCheckColor = mixColor(
    theme.palette.common.white,
    hoverBorderColor,
    0.2,
  );

  const checkedBorderColor = theme.palette.primary.main;
  const checkedCheckColor = theme.palette.common.white;

  return {
    root: {
      "&:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
    input: {
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
    },
    button: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(1.5),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: backgroundColor,
      color: theme.palette.common.white,
      boxShadow: `0 0 0 1px ${borderColor} inset`,
      cursor: "pointer",
      overflow: "hidden",
      "&:hover": {
        backgroundColor: hoverBackgroundColor,
        "&:not($buttonChecked)": {
          boxShadow: `0 0 0 1px ${hoverBorderColor} inset`,
          "& $checkbox": {
            borderTopColor: hoverBorderColor,
            color: hoverCheckColor,
          },
        },
      },
    },
    buttonChecked: {
      boxShadow: `0 0 0 2px ${checkedBorderColor} inset`,
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
      width: 0,
      height: 0,
      borderTop: `28px solid ${borderColor}`,
      borderRight: "28px solid transparent",
      color: checkColor,
      content: "''",
    },
    checkboxChecked: {
      color: checkedCheckColor,
      borderTopColor: checkedBorderColor,
    },
    checkboxIcon: {
      position: "absolute",
      top: -30,
      left: 4,
      width: 10,
      "& path": {
        stroke: "currentColor",
        strokeWidth: 2,
      },
    },
  };
});

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
    <label className={classes.root}>
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
        {image && <img className={classes.image} src={image} alt="Variant" />}
        <Typography className={classes.label} component="div">
          {label}
        </Typography>
        <div
          className={clsx(classes.checkbox, {
            [classes.checkboxChecked]: checked,
          })}
        >
          <Check className={classes.checkboxIcon} />
        </div>
      </div>
    </label>
  );
};
