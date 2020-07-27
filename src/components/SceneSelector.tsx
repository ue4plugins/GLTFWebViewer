import React from "react";
import { observer } from "mobx-react-lite";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(() => ({
  formControl: {
    display: "flex",
  },
}));

export const SceneSelector: React.FC = observer(() => {
  const { sceneStore, gltfStore } = useStores();
  const { sceneIndex, scenes, setScene } = sceneStore;
  const { hasBackdrops } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl} component="fieldset">
      <FormLabel component="legend">Cubemap</FormLabel>
      <RadioGroup
        aria-label="scene"
        id="scene-select"
        name="scene-select"
        value={sceneIndex > -1 ? sceneIndex.toString() : ""}
        onChange={e => {
          setScene(scenes[parseInt(e.target.value, 10)]);
        }}
      >
        {scenes.map((scene, i) => (
          <FormControlLabel
            key={scene.name}
            value={i.toString()}
            control={<Radio />}
            label={scene.name}
            disabled={hasBackdrops}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
});
