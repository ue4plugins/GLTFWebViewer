import "jest";
import React from "react";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useModelDrop } from "../useModelDrop";
import {
  getEmbeddedFiles,
  getUnpackedFiles,
  getInvalidFiles,
} from "../__fixtures__/files";

function createDataTransferEvent(type: string, files: File[]) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, {
    dataTransfer: {
      files,
      items: files.map(file => ({
        kind: "file",
        size: file.size,
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    },
  });
  return event;
}

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

const testGuid = "d9031d07-b017-4aa8-af51-f6bc461f37a4";
const testUrl = `http://domain.com/${testGuid}`;

describe("useModelDrop", () => {
  const mockedConsoleError = jest.fn(console.error);
  let invalidDropFiles: File[] = [];
  let unpackedDropFiles: File[] = [];
  let embeddedDropFiles: File[] = [];

  beforeAll(async () => {
    // eslint-disable-next-line
    (global as any).URL.createObjectURL = jest.fn(() => testUrl);
    console.error = mockedConsoleError;
    invalidDropFiles = getInvalidFiles();
    unpackedDropFiles = await getUnpackedFiles();
    embeddedDropFiles = await getEmbeddedFiles();
  });

  beforeEach(() => {
    mockedConsoleError.mockClear();
  });

  it("should trigger callback if valid gltf file was dropped", async () => {
    const onDrop = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useModelDrop(onDrop),
    );

    const getRootProps = result.current[3];
    const { container } = render(<div {...getRootProps()} />);
    const div = container.children[0];

    await act(async () => {
      fireEvent(div, createDataTransferEvent("drop", unpackedDropFiles));
      await waitForNextUpdate();
      await flushPromises();
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toEqual({
      name: "TestModel",
      path: testUrl,
      blobFileName: "TestModel.gltf",
    });
  });

  // it("should trigger callback if valid gltf file was dropped", async () => {
  //   const onDrop = jest.fn();
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useModelDrop(onDrop),
  //   );

  //   const getRootProps = result.current[3];
  //   const { container } = render(<div {...getRootProps()} />);
  //   const div = container.children[0];

  //   await act(async () => {
  //     fireEvent(div, createDataTransferEvent("drop", validDropFiles));
  //     await waitForNextUpdate();
  //     await flushPromises();
  //   });

  //   expect(onDrop).toHaveBeenCalledTimes(1);
  //   expect(onDrop.mock.calls[0][0]).toEqual({
  //     name: "TestModel",
  //     path: testUrl,
  //     blobFileName: "TestModel.gltf",
  //   });
  // });

  it("should abort and log error if no valid gltf file was dropped", async () => {
    const onDrop = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useModelDrop(onDrop),
    );

    const getRootProps = result.current[3];
    const { container } = render(<div {...getRootProps()} />);
    const div = container.children[0];

    await act(async () => {
      fireEvent(div, createDataTransferEvent("drop", invalidDropFiles));
      await waitForNextUpdate();
      await flushPromises();
    });

    expect(mockedConsoleError).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledTimes(0);
  });
});
