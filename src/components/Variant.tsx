import React from "react";
import {
  makeStyles,
  useRadioGroup,
  ListItem,
  ListItemText,
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  input: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  image: {
    flex: "0 0 auto",
    height: 42,
    width: 42,
    marginRight: 12,
    borderRadius: theme.shape.borderRadius,
    background: "red",
    backgroundSize: "cover",
  },
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

  return (
    <label>
      <input
        autoFocus={autoFocus}
        checked={checked}
        className={classes.input}
        id={id}
        name={name}
        onChange={e => {
          if (onChange) {
            onChange(e);
          }
          if (radioGroup?.onChange) {
            radioGroup.onChange(e, e.target.value);
          }
        }}
        tabIndex={tabIndex}
        type="radio"
        value={value}
      />
      <ListItem button selected={checked}>
        {image && (
          <span
            className={classes.image}
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        <ListItemText primary={label} />
      </ListItem>
    </label>
  );
};
