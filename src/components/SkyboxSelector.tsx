import React from "react";
import { observer } from "mobx-react-lite";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
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

export const SkyboxSelector: React.FC<{}> = observer(() => {
  const { skyboxStore } = useStores();
  const { skyboxIdx, skyboxes, setSkybox } = skyboxStore;
  const classes = useStyles();
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="skybox-selector-label">Skybox</InputLabel>
        <Select
          labelId="skybox-selector-label"
          value={skyboxIdx.toString()}
          onChange={e => {
            const idx = parseInt(e.target.value as string, 10);
            setSkybox(skyboxes[idx]);
          }}
          inputProps={{
            name: "skybox",
            id: "skybox",
          }}
        >
          {skyboxes.map((skybox, i) => (
            <MenuItem key={skybox.name} value={i.toString()}>
              {skybox.name[0].toUpperCase() + skybox.name.substr(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
    </>
  );
});
