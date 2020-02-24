import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

interface Props {
  onSelect?: (model: GLTF_MODEL) => void;
}

export const ModelList: React.FC<Props> = ({ onSelect }) => {
  return (
    <List>
      {GLTF_MODELS.map(model => (
        <ListItem
          onClick={onSelect && (() => onSelect(model))}
          button
          key={model.path + model.name}
        >
          <ListItemText primary={`${model.name} (${model.type})`} />
        </ListItem>
      ))}
    </List>
  );
};
