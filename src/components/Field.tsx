import React, { useState, useEffect, cloneElement, useCallback } from "react";
import { Configurator } from "../configurator";

export type FieldInputProps = {
  id?: number;
  value?: number;
  domain?: number[];
  onValueChange?: (value: number) => void;
};

export type FieldProps = {
  children?: React.ReactElement<FieldInputProps>;
  id: number;
  configurator: Configurator<unknown, unknown>;
};

export const Field: React.FC<FieldProps> = ({ children, id, configurator }) => {
  const [domain, setDomain] = useState<number[]>([]);
  const [value, setValue] = useState<number>();
  const [inputValue, setInputValue] = useState<number>();

  const onValueChange = useCallback(setValue, [setValue]);
  const onInputValueChange = useCallback(setInputValue, [setInputValue]);

  useEffect(() => {
    configurator.onValueChange(id, onValueChange);
    setValue(configurator.getValue(id));
    setDomain(configurator.getDomain(id));

    return () => {
      configurator.offValueChange(id, onValueChange);
      setValue(undefined);
      setDomain([]);
    };
  }, [configurator, id, onValueChange]);

  useEffect(() => {
    if (inputValue !== undefined) {
      configurator.setValue(id, inputValue);
    }
  }, [configurator, id, inputValue, onValueChange]);

  if (!children) {
    return null;
  }

  return cloneElement(children, {
    id,
    value: value,
    domain,
    onValueChange: onInputValueChange,
  });
};
