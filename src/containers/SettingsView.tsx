import React from "react";
import { observer } from "mobx-react-lite";
import {
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
} from "@material-ui/core";
import { InputGroup, SceneSelector } from "../components";
import { useStores } from "../stores";

export const SettingsView: React.FC = observer(() => {
  const { settingsStore } = useStores();
  const { showFpsMeter, toggleFpsMeter } = settingsStore;
  return (
    <>
      <InputGroup>
        <SceneSelector />
      </InputGroup>
      <InputGroup>
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
      </InputGroup>
    </>
  );
});
