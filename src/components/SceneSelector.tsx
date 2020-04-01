import React from "react";
import { observer } from "mobx-react-lite";
import { Select, InputLabel, FormControl, MenuItem } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(theme =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

export const SceneSelector: React.FC = observer(() => {
  const { sceneStore } = useStores();
  const { sceneIdx, scenes, setScene } = sceneStore;
  const classes = useStyles();
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="scene-selector-label">Scene</InputLabel>
        <Select
          labelId="scene-selector-label"
          value={sceneIdx.toString()}
          onChange={e => {
            const idx = parseInt(e.target.value as string, 10);
            setScene(scenes[idx]);
          }}
          inputProps={{
            name: "scene",
            id: "scene",
          }}
        >
          {scenes.map((scene, i) => (
            <MenuItem key={scene.name} value={i.toString()}>
              {scene.name[0].toUpperCase() + scene.name.substr(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
    </>
  );
});
