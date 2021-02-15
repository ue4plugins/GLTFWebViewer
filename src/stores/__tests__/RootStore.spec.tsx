import "jest";
import React from "react";
import { render } from "@testing-library/react";
import { RootStoreProvider, useStores } from "../RootStore";

describe("RootStore", () => {
  it("should pass stores via context", async () => {
    const StoreConsumer: React.FC = () => {
      const { gltfStore } = useStores();
      return <span>Gltf: {String(gltfStore.gltf)}</span>;
    };

    const { getByText } = render(
      <RootStoreProvider>
        <StoreConsumer />
      </RootStoreProvider>,
    );

    expect(getByText(/^Gltf:/).textContent).toBe("Gltf: undefined");
  });
});
