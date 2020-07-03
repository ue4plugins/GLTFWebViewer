import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Divider } from "@material-ui/core";
import { useStores } from "../stores";
import { GltfVariantSetConfigurator } from "../types";
import { Field } from "./Field";
import { VariantSet } from "./VariantSet";

type Fields = GltfVariantSetConfigurator["manager"]["fields"];

export const VariantSetList: React.FC = observer(() => {
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
      {fields.map((field, fieldIndex) => (
        <>
          <Field key={fieldIndex} id={fieldIndex} configurator={configurator}>
            <VariantSet
              label={field.name}
              domainLabels={field.values.map(variant => variant.name)}
              domainImages={field.values.map(
                variant => variant.thumbnailSource,
              )}
            />
          </Field>
          <Divider />
        </>
      ))}
    </>
  );
});
