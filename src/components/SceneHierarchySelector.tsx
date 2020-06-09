import React from "react";
import { observer } from "mobx-react-lite";
import { Select, InputLabel, FormControl, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1, 2),
    minWidth: 120,
  },
}));

export const SceneHierarchySelector: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const {
    sceneHierarchyIndex: sceneIndex,
    sceneHierarchies: scenes,
    setSceneHierarchy: setScene,
  } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="scene-selector-label">Scene</InputLabel>
      <Select
        id="scene-hierarchy-select"
        labelId="scene-hierarchy-selector-label"
        value={sceneIndex > -1 ? sceneIndex.toString() : ""}
        onChange={e => {
          const idx = parseInt(e.target.value as string, 10);
          setScene(scenes[idx]);
        }}
        inputProps={{
          name: "scene-hierarchy-select-input",
          id: "scene-hierarchy-select-input",
        }}
        MenuProps={{
          id: "scene-hierarchy-select-list",
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
