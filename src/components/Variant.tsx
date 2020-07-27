import React from "react";
import {
  makeStyles,
  useRadioGroup,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  input: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
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
      <ListItem button>
        <ListItemAvatar>
          <Avatar src={image} />
        </ListItemAvatar>
        <ListItemText primary={label} />
        <Checkbox
          edge="end"
          checked={checked}
          onChange={e => {
            e.target.value = value?.toString() ?? "";
            _onChange(e);
          }}
        />
      </ListItem>
    </label>
  );
};
