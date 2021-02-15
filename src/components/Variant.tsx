import React, { cloneElement } from "react";
import { makeStyles, useRadioGroup, Typography } from "@material-ui/core";
import clsx from "clsx";
import { ReactComponent as Check } from "../icons/Check.svg";
import { mixColor } from "../utilities";
import { AppearProps } from "./Appear";

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
      userSelect: "none",
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
      transition: theme.transitions.create(["background-color", "box-shadow"], {
        duration: theme.transitions.duration.short,
      }),
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
    label: {
      fontSize: theme.typography.pxToRem(14),
    },
    checkbox: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      borderTop: `28px solid ${borderColor}`,
      borderRight: "28px solid transparent",
      color: checkColor,
      transition: theme.transitions.create(["color", "border-color"], {
        duration: theme.transitions.duration.short,
      }),
      content: "''",
    },
    checkboxChecked: {
      color: checkedCheckColor,
      borderTopColor: checkedBorderColor,
    },
    checkboxIcon: {
      position: "absolute",
      top: -23,
      left: 5,
    },
  };
});

export type VariantProps = {
  appear?: React.ReactElement<AppearProps>;
  autoFocus?: boolean;
  checked?: boolean;
  id?: string;
  image?: string;
  label: string;
  name?: string;
  tabIndex?: number;
  value?: string | number | string[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export const Variant: React.FC<VariantProps> = ({
  appear,
  autoFocus,
  checked: checkedProp,
  id,
  image,
  label,
  name: nameProp,
  tabIndex,
  value,
  onChange,
  onClick,
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

  const _onClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const content = (
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
  );

  return (
    <label className={classes.root}>
      <input
        autoFocus={autoFocus}
        checked={checked}
        className={classes.input}
        id={id}
        name={name}
        onChange={_onChange}
        onClick={_onClick}
        tabIndex={tabIndex}
        type="radio"
        value={value}
      />
      {appear ? cloneElement(appear, { children: content }) : content}
    </label>
  );
};
