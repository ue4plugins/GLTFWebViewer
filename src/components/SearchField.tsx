import React, { useState } from "react";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

interface Props {
  term: string;
  onChange: (term: string) => void;
}

export const SearchField: React.FC<Props> = ({ term, onChange }) => {
  const [debounce, setDebounce] = useState<NodeJS.Timeout>();
  const classes = useStyles();
  return (
    <ListItem className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Search models"
        inputProps={{ "aria-label": "search models", spellCheck: "false" }}
        value={term}
        onChange={e => {
          const { value } = e.target;
          debounce && clearTimeout(debounce);
          setDebounce(
            setTimeout(() => {
              onChange(value);
            }, 10),
          );
        }}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </ListItem>
  );
};
