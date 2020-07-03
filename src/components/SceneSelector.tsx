import React from "react";
import { observer } from "mobx-react-lite";
import { Select, InputLabel, FormControl, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  formControl: {
    display: "flex",
    margin: theme.spacing(1, 2),
    minWidth: 120,
  },
}));

export const SceneSelector: React.FC = observer(() => {
  const { sceneStore } = useStores();
  const { sceneIndex, scenes, setScene } = sceneStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="scene-selector-label">Cubemap</InputLabel>
      <Select
        id="scene-select"
        labelId="scene-selector-label"
        value={sceneIndex > -1 ? sceneIndex.toString() : ""}
        onChange={e => {
          const idx = parseInt(e.target.value as string, 10);
          setScene(scenes[idx]);
        }}
        inputProps={{
          name: "scene-select-input",
          id: "scene-select-input",
        }}
        MenuProps={{
          id: "scene-select-list",
        }}
      >
        {scenes.map((scene, i) => (
          <MenuItem key={scene.name} value={i.toString()}>
            {scene.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
