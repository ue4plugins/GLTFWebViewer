import React from "react";
import { VariantSetManager } from "../variants";
import { VariantSet } from "./VariantSet";

export type LevelVariantProps = {
  variantSets: number[];
  manager: VariantSetManager;
};

export const LevelVariantSet: React.FC<LevelVariantProps> = ({
  variantSets,
  manager,
}) => {
  let variantCount = 0;
  return (
    <>
      {variantSets.map(setId => {
        const set = (
          <VariantSet
            key={setId}
            id={setId}
            variantIdOffset={variantCount}
            manager={manager}
          />
        );
        variantCount += manager.getVariantIds(setId).length;
        return set;
      })}
    </>
  );
};
