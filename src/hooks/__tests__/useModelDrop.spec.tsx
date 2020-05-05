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
  getBinaryFiles,
} from "../__fixtures__/files";
import { readFile } from "../utility";

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
  const mockedConsoleError = jest.fn();
  const mockedCreateObjectURL = jest.fn((_: Blob) => testUrl);
  let invalidDropFiles: File[] = [];
  let unpackedDropFiles: File[] = [];
  let embeddedDropFiles: File[] = [];
  let binaryDropFiles: File[] = [];

  beforeAll(async () => {
    // eslint-disable-next-line
    (global as any).URL.createObjectURL = mockedCreateObjectURL;
    console.error = mockedConsoleError;
    invalidDropFiles = getInvalidFiles();
    unpackedDropFiles = await getUnpackedFiles();
    embeddedDropFiles = await getEmbeddedFiles();
    binaryDropFiles = await getBinaryFiles();
  });

  beforeEach(() => {
    mockedConsoleError.mockClear();
    mockedCreateObjectURL.mockClear();
  });

  it("should trigger callback for embedded gltf files", async () => {
    const onDrop = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useModelDrop(onDrop),
    );

    const getRootProps = result.current[3];
    const { container } = render(<div {...getRootProps()} />);
    const div = container.children[0];

    await act(async () => {
      fireEvent(div, createDataTransferEvent("drop", embeddedDropFiles));
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

  it("should trigger callback for binary glb files", async () => {
    const onDrop = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useModelDrop(onDrop),
    );

    const getRootProps = result.current[3];
    const { container } = render(<div {...getRootProps()} />);
    const div = container.children[0];

    await act(async () => {
      fireEvent(div, createDataTransferEvent("drop", binaryDropFiles));
      await waitForNextUpdate();
      await flushPromises();
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toEqual({
      name: "TestModel",
      path: testUrl,
      blobFileName: "TestModel.glb",
    });
  });

  it("should trigger callback for unpacked gltf files", async () => {
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

  it("should update asset references for unpacked gltf files", async () => {
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

    expect(mockedCreateObjectURL).toHaveBeenCalledTimes(
      unpackedDropFiles.length,
    );

    const gltfFile =
      mockedCreateObjectURL.mock.calls[unpackedDropFiles.length - 1][0];
    const gltfFileContent = await readFile(gltfFile, "text");
    const gltf = JSON.parse(gltfFileContent!); // eslint-disable-line

    // Ensures that reference to asset in same directory work
    expect(gltf?.buffers[0]?.uri).toBe(testGuid);

    // Ensures that reference to asset in sub directory work
    expect(gltf?.images[0]?.uri).toBe(testGuid);
    expect(gltf?.images[1]?.uri).toBe(testGuid);
  });

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
