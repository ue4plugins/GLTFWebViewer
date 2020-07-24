import React from "react";
import { observer } from "mobx-react-lite";
import {
  Divider,
  FormControlLabel,
  Checkbox,
  FormGroup,
  makeStyles,
} from "@material-ui/core";
import { SceneSelector } from "../components";
import { useStores } from "../stores";

const useStyles = makeStyles(theme => ({
  fpsMeter: {
    margin: theme.spacing(1, 2),
  },
}));

export const Settings: React.FC = observer(() => {
  const classes = useStyles();
  const { settingsStore } = useStores();
  const { showFpsMeter, toggleFpsMeter } = settingsStore;
  return (
    <>
      <SceneSelector />
      <Divider />
      <FormGroup className={classes.fpsMeter} row>
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
      <Divider />
    </>
  );
});
