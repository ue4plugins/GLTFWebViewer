import React, { useRef, useState } from "react";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
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
  const [value, setValue] = useState(term);
  const debounceRef = useRef<NodeJS.Timeout>();
  const classes = useStyles();
  return (
    <ListItem className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Search models"
        inputProps={{ "aria-label": "search models", spellCheck: "false" }}
        value={value}
        onChange={e => {
          const { value } = e.target;
          setValue(value);
          debounceRef.current && clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            onChange(value);
          }, 10);
        }}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
        onClick={() => {
          if (term) {
            onChange("");
          }
        }}
      >
        {term ? <ClearIcon /> : <SearchIcon />}
      </IconButton>
    </ListItem>
  );
};
