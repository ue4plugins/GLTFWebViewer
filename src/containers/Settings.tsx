import React from "react";
import { observer } from "mobx-react-lite";
import {
  FormControlLabel,
  Checkbox,
  FormGroup,
  makeStyles,
  FormLabel,
} from "@material-ui/core";
import { SceneSelector } from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  group: {
    margin: theme.spacing(2, 2, 1, 2),
  },
}));

export const Settings: React.FC = observer(() => {
  const classes = useStyles();
  const { settingsStore } = useStores();
  const { showFpsMeter, toggleFpsMeter } = settingsStore;
  return (
    <>
      <div className={classes.group}>
        <SceneSelector />
      </div>
      <div className={classes.group}>
        <FormLabel component="legend">User interface</FormLabel>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={showFpsMeter}
                onChange={e => toggleFpsMeter(e.target.checked)}
                name="showFpsMeter"
              />
            }
            label="Show FPS meter"
          />
        </FormGroup>
      </div>
    </>
  );
});
