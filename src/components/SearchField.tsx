import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { InputBase, ListItem, IconButton } from "@material-ui/core";
import { Search, Clear } from "@material-ui/icons";
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
}));

interface Props {
  term: string;
  onChange: (term: string) => void;
}

export const SearchField: React.FC<Props> = ({ term, onChange }) => {
  const classes = useStyles();
  const [value, setValue] = useState(term);
  const debouncedOnChange = useCallback(
    debounce((t: string) => onChange(t), 100),
    [onChange],
  );

  useEffect(() => setValue(term), [term]);

  return (
    <ListItem className={classes.root}>
      <InputBase
        id="search-input"
        className={classes.input}
        placeholder="Search models"
        inputProps={{ "aria-label": "search models", spellCheck: "false" }}
        value={value}
        onChange={e => {
          const { value } = e.target;
          setValue(value);
          debouncedOnChange(value);
          e.stopPropagation();
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
        {term ? <Clear /> : <Search />}
      </IconButton>
    </ListItem>
  );
};
