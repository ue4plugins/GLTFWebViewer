import React from "react";
import { observer } from "mobx-react-lite";
import { FormControl, FormLabel, RadioGroup } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";
import { Variant } from "../components/Variant";

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 2,
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    display: "flex",
  },
  label: {
    margin: theme.spacing(2, 2, 0.5, 2),
  },
}));

export const Cameras: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { cameras, camera, setCamera } = gltfStore;
  const classes = useStyles();

  return (
    <FormControl className={classes.root} component="fieldset">
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
          <Variant
            key={camera.id}
            value={camera.id.toString()}
            label={camera.name + (camera.orbit ? " (orbital)" : "")}
            image={camera.previewSource}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
});
