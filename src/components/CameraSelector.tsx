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

export const CameraSelector: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { cameras, camera, setCamera } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl} component="fieldset">
      <FormLabel component="legend">Camera</FormLabel>
      <RadioGroup
        aria-label="camera"
        id="camera-select"
        name="camera-select"
        value={camera !== undefined ? camera.id.toString() : ""}
        onChange={e => {
          setCamera(cameras.find(c => c.id === parseInt(e.target.value, 10)));
        }}
      >
        {cameras.map(camera => (
          <FormControlLabel
            key={camera.id}
            value={camera.id.toString()}
            control={<Radio />}
            label={camera.name + (camera.orbit ? " (orbital)" : "")}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
});
