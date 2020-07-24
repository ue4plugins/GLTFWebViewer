import React from "react";
import { observer } from "mobx-react-lite";
import {
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  ListItemText,
  Checkbox,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  formControl: {
    display: "flex",
    margin: theme.spacing(1, 2),
  },
}));

export const AnimationSelector: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { activeAnimationIds, animations } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="animation-selector-label">Animation</InputLabel>
      <Select
        id="animation-select"
        labelId="animation-selector-label"
        multiple
        value={activeAnimationIds}
        onChange={e => {
          const active = e.target.value as number[];
          animations.forEach(a => {
            a.active = active.includes(a.id);
          });
        }}
        renderValue={values =>
          `${(values as number[]).length}/${animations.length} active`
        }
        inputProps={{
          name: "animation-select-input",
          id: "animation-select-input",
        }}
        MenuProps={{
          id: "animation-select-list",
        }}
      >
        {animations.map(animation => (
          <MenuItem key={animation.id} value={animation.id}>
            <Checkbox
              checked={activeAnimationIds.some(id => id === animation.id)}
            />
            <ListItemText primary={animation.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
