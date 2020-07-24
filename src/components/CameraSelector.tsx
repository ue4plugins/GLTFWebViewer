import React from "react";
import { observer } from "mobx-react-lite";
import { Select, InputLabel, FormControl, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  formControl: {
    display: "flex",
    margin: theme.spacing(1, 2),
  },
}));

export const CameraSelector: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { cameras, camera, setCamera } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="camera-selector-label">Camera</InputLabel>
      <Select
        id="camera-select"
        labelId="camera-selector-label"
        value={camera !== undefined ? camera.id : -1}
        onChange={e => {
          setCamera(cameras.find(c => c.id === (e.target.value as number)));
        }}
        inputProps={{
          name: "camera-select-input",
          id: "camera-select-input",
        }}
        MenuProps={{
          id: "camera-select-list",
        }}
      >
        {cameras.map(camera => (
          <MenuItem key={camera.id} value={camera.id}>
            {camera.name}
            {camera.orbit && " (orbital)"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
