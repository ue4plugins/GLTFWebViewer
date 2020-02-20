import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

interface Props {
  onSelect?: (item: string) => void;
}

export const ModelList: React.FC<Props> = ({ onSelect }) => {
  return (
    <List>
      {GLTF_MODELS.map(text => (
        <ListItem
          onClick={onSelect && (() => onSelect(text))}
          button
          key={text}
        >
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  );
};
