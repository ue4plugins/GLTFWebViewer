import React, { useEffect, useRef, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import Debug from "debug";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import { PlayCanvasViewer } from "../playcanvas";
import { useStores } from "../stores";
import {
  useAsyncWithLoadingAndErrorHandling,
  usePreventableCameraInteractions,
  useGltfDrop,
} from "../hooks";

const debug = Debug("Viewer");

const useStyles = makeStyles(theme => ({
  canvas: {
    position: "relative",
    maxWidth: "100%",
  },
  backdrop: {
    position: "absolute",
    zIndex: 3,
    color: theme.palette.common.white,
  },
  error: {
    maxWidth: 300,
  },
}));

export const Viewer: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore, sceneStore } = useStores();
  const { gltf, setGltf, activeAnimationIds, setAnimations } = gltfStore;
  const { scene, setScenes } = sceneStore;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<PlayCanvasViewer>();

  const onDropGltf = useCallback(setGltf, [setGltf]);
  const [
    isDragActive,
    hasDropError,
    setHasDropError,
    getRootProps,
  ] = useGltfDrop(onDropGltf);

  const [
    isLoading,
    hasLoadError,
    runAsync,
  ] = useAsyncWithLoadingAndErrorHandling();

  const showBackdrop =
    isLoading || hasLoadError || isDragActive || hasDropError;

  const [setPreventInteraction] = usePreventableCameraInteractions(
    showBackdrop,
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    debug("Create viewer");
    const viewer = new PlayCanvasViewer(canvasRef.current);

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
  }, [runAsync]);

  useEffect(() => {
    if (!viewer?.initiated) {
      return;
    }
    debug("Set scene list", viewer.scenes);
    setScenes(viewer.scenes);

    return () => {
      debug("Unset scene list");
      setScenes([]);
    };
  }, [viewer, setScenes]);

  useEffect(() => {
    if (!viewer?.initiated || !scene) {
      return;
    }

    runAsync(async () => {
      debug("Load scene start", scene.url);
      await viewer.loadScene(scene.url);
      debug("Load scene end", scene.url);
    });

    return () => {
      debug("Destroy scene");
      viewer.destroyScene();
    };
  }, [runAsync, viewer, scene]);

  useEffect(() => {
    if (!viewer?.initiated || !gltf) {
      return;
    }

    runAsync(async () => {
      debug("Load glTF start", gltf.filePath);
      await viewer.loadGltf(gltf.filePath, gltf.blobFileName);
      debug("Load glTF end", gltf.filePath);
      debug("Set animation list", viewer.animations);
      setAnimations(viewer.animations);
    });

    return () => {
      debug("Destroy glTF");
      viewer.destroyGltf();
      debug("Unset animation list");
      setAnimations([]);
    };
  }, [runAsync, viewer, gltf, setAnimations]);

  useEffect(() => {
    if (!viewer?.initiated || !gltf) {
      return;
    }

    debug("Set active animations");
    viewer.setActiveAnimations(activeAnimationIds);
  }, [viewer, gltf, activeAnimationIds]);

  useEffect(() => {
    debug("Reset drop error state");
    setHasDropError(false);
  }, [gltf, scene, setHasDropError, viewer]);

  useEffect(() => {
    debug("Prevent camera interaction", showBackdrop);
    setPreventInteraction(showBackdrop);
  }, [showBackdrop, setPreventInteraction]);

  return (
    <div {...getRootProps()}>
      <canvas className={classes.canvas} ref={canvasRef} />
      <Backdrop className={classes.backdrop} open={showBackdrop}>
        {isDragActive ? (
          <Typography variant="h5" color="inherit">
            Drop glTF and accompanying assets here
          </Typography>
        ) : isLoading ? (
          <CircularProgress />
        ) : hasDropError || hasLoadError ? (
          <Card className={classes.error}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Error
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Something went wrong when loading the asset. Check console for
                more details.
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </Backdrop>
    </div>
  );
});
