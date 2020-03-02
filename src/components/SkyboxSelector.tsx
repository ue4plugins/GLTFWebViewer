import React, { useState } from "react";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  onSelect?: (skybox: SKYBOX_CUBEMAP) => void;
}

export const SkyboxSelector: React.FC<Props> = ({ onSelect }) => {
  const classes = useStyles();
  const [skyboxIdx, setSkyboxIdx] = useState(1);
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="skybox-selector-label">Skybox</InputLabel>
        <Select
          labelId="skybox-selector-label"
          value={skyboxIdx}
          onChange={e => {
            setSkyboxIdx(e.target.value as number);
            onSelect && onSelect(SKYBOX_CUBEMAPS[e.target.value as number]);
          }}
          inputProps={{
            name: "skybox",
            id: "skybox",
          }}
        >
          {SKYBOX_CUBEMAPS.map((skybox, i) => (
            <MenuItem key={skybox.name} value={i}>
              {skybox.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
    </>
  );
};
