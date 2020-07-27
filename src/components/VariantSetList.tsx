import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { makeStyles, FormLabel } from "@material-ui/core";
import { useStores } from "../stores";
import { GltfVariantSetConfigurator } from "../types";
import { Field } from "./Field";
import { VariantSet } from "./VariantSet";

type Fields = GltfVariantSetConfigurator["manager"]["fields"];

const useStyles = makeStyles(theme => ({
  label: {
    margin: theme.spacing(2, 2, 1, 2),
  },
}));

export const VariantSetList: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { configurator } = gltfStore;
  const [fields, setFields] = useState<Fields>([]);

  useEffect(() => {
    if (configurator) {
      setFields(configurator.manager.fields);
    }

    return () => {
      setFields([]);
    };
  }, [configurator]);

  if (!configurator) {
    return null;
  }

  return (
    <>
      <FormLabel className={classes.label} component="legend">
        Variant sets
      </FormLabel>
      {fields.map((field, fieldIndex) => (
        <Field key={fieldIndex} id={fieldIndex} configurator={configurator}>
          <VariantSet
            label={field.name}
            domainLabels={field.values.map(variant => variant.name)}
            domainImages={field.values.map(variant => variant.thumbnailSource)}
          />
        </Field>
      ))}
    </>
  );
});
