import React from "react";
import { observer } from "mobx-react-lite";
import {
  FormControl,
  Checkbox,
  FormLabel,
  FormControlLabel,
  FormGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(() => ({
  formControl: {
    display: "flex",
  },
}));

export const AnimationSelector: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { activeAnimationIds, animations } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl} component="fieldset">
      <FormLabel component="legend">Animation</FormLabel>
      <FormGroup aria-label="animations" id="animation-select">
        {animations.length > 1 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={activeAnimationIds.length === animations.length}
                onChange={e => {
                  animations.forEach(
                    animation => (animation.active = e.target.checked),
                  );
                }}
              />
            }
            label="All"
          />
        )}
        {animations.map(animation => (
          <FormControlLabel
            key={animation.id}
            control={
              <Checkbox
                checked={activeAnimationIds.some(id => id === animation.id)}
                onChange={e => {
                  animation.active = e.target.checked;
                }}
              />
            }
            label={animation.name}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
});
