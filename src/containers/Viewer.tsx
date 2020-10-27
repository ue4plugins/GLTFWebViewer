import React, { useEffect, useRef, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import Debug from "debug";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  useTheme,
  Card,
} from "@material-ui/core";
import clsx from "clsx";
import { PlayCanvasViewer } from "../playcanvas";
import { useStores } from "../stores";
import {
  useAsyncWithLoadingAndErrorHandling,
  usePreventableCameraInteractions,
  useGltfDrop,
} from "../hooks";
import { MessageBox } from "../components";

const debug = Debug("Viewer");

const useStyles = makeStyles(theme => ({
  root: {
    // Extra height and width adjusts for rounding issue when
    // centering canvas vertically and horizontally
    height: "calc(100% + 4px)",
    width: "calc(100% + 4px)",
    outline: 0,
  },
  canvasWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translateY(-50%) translateX(-50%)",
  },
  canvas: {
    outline: 0,
  },
  backdrop: {
    position: "absolute",
    zIndex: 3,
    color: theme.palette.common.white,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    transition:
      theme.transitions.create(["opacity", "background-color"], {
        duration: theme.transitions.duration.shortest,
      }) + " !important",
  },
  backdropTransparent: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  backdropBorder: {
    border: `3px solid ${theme.palette.primary.main}`,
  },
  messageBox: {
    maxWidth: 320,
  },
}));

export type ViewerProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
};

export const Viewer: React.FC<ViewerProps> = observer(
  ({
    isError = false,
    isEmpty = false,
    isLoading: globalIsLoading = false,
  }) => {
    const classes = useStyles();
    const theme = useTheme();
    const { gltfStore, settingsStore } = useStores();
    const { gltf, setGltf, setSceneHierarchy, camera } = gltfStore;
    const { enableDragAndDrop, showUI } = settingsStore;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewer, setViewer] = useState<PlayCanvasViewer>();

    const onDropGltf = useCallback(setGltf, [setGltf]);
    const [
      isDragActive,
      hasDropError,
      setHasDropError,
      getRootProps,
    ] = useGltfDrop(onDropGltf, enableDragAndDrop);

    const [
      localIsLoading,
      hasLoadError,
      runAsync,
    ] = useAsyncWithLoadingAndErrorHandling();

    const isLoading = globalIsLoading || localIsLoading;
    const hasError = hasLoadError || hasDropError || isError;
    const showBackdrop =
      showUI && (isLoading || isDragActive || hasError || isEmpty);

    const [setPreventInteraction] = usePreventableCameraInteractions(
      showBackdrop,
    );

    // PlayCanvasViewer: Instantiate and configure
    useEffect(() => {
      if (!canvasRef.current) {
        return;
      }

      debug("Create viewer");
      const viewer = new PlayCanvasViewer(canvasRef.current, {
        width: theme.cameraPreviewWidth,
        height: theme.cameraPreviewHeight,
      });

      runAsync(async () => {
        debug("Configure viewer start");
        await viewer.configure();
        setViewer(viewer);
        window.viewer = viewer;
        debug("Configure viewer end");
      });

      return () => {
        debug("Destroy viewer");
        window.viewer = undefined;
        viewer.destroy();
      };
    }, [runAsync, theme.cameraPreviewHeight, theme.cameraPreviewWidth]);

    // PlayCanvasViewer: Load glTF
    // GltfStore: Update scene hierarchy list
    useEffect(() => {
      if (!viewer?.initiated || !gltf) {
        return;
      }

      runAsync(async () => {
        debug("Load glTF start", gltf.filePath);
        setSceneHierarchy();
        await viewer.loadGltf(gltf.filePath, gltf.blobFileName);
        viewer.initAnimations();
        debug("Load glTF end", gltf.filePath);

        if (viewer.activeSceneHierarchy) {
          debug("Set scene hierachy", viewer.activeSceneHierarchy);
          setSceneHierarchy(viewer.activeSceneHierarchy);
        }
      });

      return () => {
        debug("Destroy glTF");
        viewer.destroyGltf();

        debug("Unset scene hierachy");
        setSceneHierarchy();
      };
    }, [runAsync, viewer, gltf, setSceneHierarchy]);

    // PlayCanvasViewer: Set active camera
    useEffect(() => {
      if (!viewer?.initiated || !camera) {
        return;
      }
      debug("Set active camera", camera);
      viewer.setActiveCamera(camera.id);
    }, [viewer, camera]);

    // Reset error state
    useEffect(() => {
      debug("Reset drop error state");
      setHasDropError(false);
    }, [gltf, setHasDropError, viewer]);

    // Prevent camera interactions
    useEffect(() => {
      debug("Prevent camera interaction", showBackdrop);
      setPreventInteraction(showBackdrop);
    }, [showBackdrop, setPreventInteraction]);

    return (
      <div className={classes.root} {...getRootProps()}>
        <div className={classes.canvasWrapper}>
          <canvas className={classes.canvas} ref={canvasRef} />
        </div>
        <Backdrop
          className={clsx(classes.backdrop, {
            [classes.backdropTransparent]: !isLoading,
            [classes.backdropBorder]: isDragActive,
          })}
          open={showBackdrop}
        >
          {isLoading ? (
            <CircularProgress />
          ) : hasError ? (
            <Card className={classes.messageBox}>
              <MessageBox
                icon="error"
                overline="Oops!"
                title="Unexpected issue"
              >
                We tried our best but something went wrong when loading{" "}
                {isError ? "assets" : "the asset"}. Check console for more
                details.
              </MessageBox>
            </Card>
          ) : isEmpty || isDragActive ? (
            <Card className={classes.messageBox}>
              <MessageBox icon="dragdrop" title="Drop glTF file here">
                Drop a .gltf or .glb file with accompanying assets to view them.
              </MessageBox>
            </Card>
          ) : null}
        </Backdrop>
      </div>
    );
  },
);
