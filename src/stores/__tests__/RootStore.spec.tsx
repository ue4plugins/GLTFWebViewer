import "jest";
import React from "react";
import { render } from "@testing-library/react";
import { RootStoreProvider, useStores } from "../RootStore";

describe("RootStore", () => {
  it("should pass stores via context", async () => {
    const StoreConsumer: React.FC = () => {
      const { gltfStore, sceneStore } = useStores();
      return (
        <span>
          Scene: {sceneStore.sceneIndex}, Gltf: {String(gltfStore.model)}
        </span>
      );
    };

    const { getByText } = render(
      <RootStoreProvider>
        <StoreConsumer />
      </RootStoreProvider>,
    );

    expect(getByText(/^Scene:/).textContent).toBe("Scene: -1, Gltf: undefined");
  });
});
