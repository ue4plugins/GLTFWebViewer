/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDecoderModule } from "draco3dgltf";
import pc from "playcanvas";
import Debug from "debug";
import { GlTf } from "./gltf/types";
import { GlTfParser } from "./gltf/GlTfParser";
import { AnimationClip } from "./gltf/animation/AnimationClip";
import { createCameraScripts } from "./createCameraScripts";
import { AnimationComponent } from "./gltf/animation/AnimationComponent";

const debug = Debug("viewer");

interface Resources {
  model?: pc.Model;
  textures: pc.Texture[];
  animations: AnimationClip[];
}

export class Viewer {
  private decoderModule = createDecoderModule({});
  public app: pc.Application;
  public camera: pc.Entity;
  public playing = true;
  public gltf?: pc.Entity & { animComponent?: AnimationComponent };
  public asset?: pc.Asset;
  public textures: pc.Texture[] = [];
  public animations: AnimationClip[] = [];

  public constructor(public canvas: HTMLCanvasElement) {
    if (!canvas) {
      throw new Error("Missing canvas");
    }
    this.windowResizeHandler = this.windowResizeHandler.bind(this);

    debug("Creating viewer", canvas);
    const app = new pc.Application(this.canvas, {
      mouse: new pc.Mouse(document.body),
      keyboard: new pc.Keyboard(window),
    });
    this.app = app;

    createCameraScripts(app);

    // rotator script
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Rotate: any = pc.createScript("rotate");
    Rotate.prototype.update = function(deltaTime: number) {
      this.entity.rotate(0, deltaTime * 20, 0);
    };

    debug("Starting app");
    app.start();

    // Fill the available space at full resolution
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );

    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.toneMapping = pc.TONEMAP_ACES;

    app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

    // Ensure canvas is resized when window changes size
    window.addEventListener("resize", this.windowResizeHandler);

    // Create camera entity
    debug("Creating camera");
    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      fov: 45.8366,
    });
    camera.addComponent("script");
    camera.setPosition(0, 0, 8);
    this.camera = camera;
    app.root.addChild(camera);

    if (camera.script) {
      camera.script.create("orbitCamera");
      camera.script.create("keyboardInput");
      camera.script.create("mouseInput");
      if (this.cameraPosition) {
        (camera.script as any).orbitCamera.distance = this.cameraPosition.length();
      } else if (this.gltf) {
        (camera.script as any).orbitCamera.focusEntity = this.gltf;
      }
      // (camera.script as any).orbitCamera.frameOnStart = true;
    }

    // Create directional light entity
    debug("Creating light");
    const light = new pc.Entity("light");
    light.addComponent("light", {
      type: "point",
      color: new pc.Color(0.15, 0.1, 0.1),
      castShadows: true,
      shadowType: pc.SHADOW_VSM32,
      range: 200,
      intensity: 10,
    });
    light.setLocalPosition(4, 5, 10);
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(light);

    // Set a prefiltered cubemap as the skybox
    const cubemapBasePath = "./assets/cubemaps/helipad";
    const cubemapAsset = new pc.Asset(
      "helipad",
      "cubemap",
      {
        url: `${cubemapBasePath}/Helipad.dds`,
      },
      {
        textures: [
          `${cubemapBasePath}/Helipad_posx.png`,
          `${cubemapBasePath}/Helipad_negx.png`,
          `${cubemapBasePath}/Helipad_posy.png`,
          `${cubemapBasePath}/Helipad_negy.png`,
          `${cubemapBasePath}/Helipad_posz.png`,
          `${cubemapBasePath}/Helipad_negz.png`,
        ],
        magFilter: 1,
        minFilter: 5,
        anisotropy: 1,
        name: "Helipad",
        rgbm: true,
        prefiltered: "Helipad.dds",
      },
    );
    app.assets.add(cubemapAsset);
    app.assets.load(cubemapAsset);

    cubemapAsset.ready(() => {
      debug("Cubemap ready");
      app.scene.skyboxMip = 2;
      (app.scene as any).setSkybox(cubemapAsset.resources);
    });
  }

  private windowResizeHandler() {
    this.app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );
  }

  public get cameraPosition() {
    return this.camera.getPosition();
  }

  public destroy() {
    this.destroyScene();
    window.removeEventListener("resize", this.windowResizeHandler);
    this.app.destroy();
  }

  public destroyScene() {
    this.textures.forEach(texture => {
      texture.destroy();
    });

    if (this.gltf) {
      // if (this.gltf.animComponent) {
      //   this.gltf.animComponent.stopClip();
      // }
      if ((this.camera.script as any).orbitCamera.focusEntity) {
        (this.camera.script as any).orbitCamera.focusEntity = null;
      }
      this.gltf.destroy();
    }

    if (this.asset) {
      // If not done in this order,
      // the entity will be retained by the JS engine.
      this.app.assets.remove(this.asset);
      this.asset.unload();
    }

    // Reset props
    this.asset = undefined;
    this.gltf = undefined;
    this.textures = [];
  }

  public initScene() {
    if (this.gltf || !this.asset) {
      // Scene already initialized or missing asset
      return;
    }
    // Add the loaded scene to the hierarchy
    this.gltf = new pc.Entity("gltf");
    this.gltf.addComponent("model", {
      asset: this.asset,
      castShadows: true,
      receiveShadows: true,
      shadowType: pc.SHADOW_VSM32,
    });
    this.gltf.addComponent("script");
    // this.gltf.script?.create("rotate");
    this.app.root.addChild(this.gltf);

    // Now that the model is created, after translateAnimation, we have to hook here
    if (this.animations) {
      for (let i = 0; i < this.animations.length; i += 1) {
        for (let c = 0; c < this.animations[i].animCurves.length; c += 1) {
          const curve = this.animations[i].animCurves[c];
          if (curve.animTargets[0].targetNode === "model") {
            curve.animTargets[0].targetNode = this.gltf;
          }
        }
      }
    }

    debug("Animations", this.animations);

    // Load any animations
    if (this.animations && this.animations.length > 0) {
      // If we don't already have an animation component, create one.
      // Note that this isn't really a 'true' component like those
      // found in the engine...
      if (!this.gltf.animComponent) {
        this.gltf.animComponent = new AnimationComponent();
      }

      // Add all animations to the model's animation component
      for (let i = 0; i < this.animations.length; i += 1) {
        this.animations[i].transferToRoot(this.gltf);
        this.gltf.animComponent.addClip(this.animations[i]);
      }
      this.gltf.animComponent.curClip = this.animations[0].name;
      this.pauseAnimationClips();
      this.playCurrentAnimationClip();

      debug("AnimationComponent", this.gltf.animComponent);

      // select_remove_options(this.anim_select);
      // for (i = 0; i < animationClips.length; i += 1) {
      //   select_add_option(this.anim_select, this.animations[i].name);
      // }
      // this.anim_info.innerHTML =
      //   this.animations.length + " animation clips loaded";
    }

    // Focus the camera on the newly loaded scene
    if ((this.camera.script as any).orbitCamera) {
      if (this.cameraPosition) {
        (this.camera
          .script as any).orbitCamera.distance = this.cameraPosition.length();
      } else {
        (this.camera.script as any).orbitCamera.frameOnStart = true;
        (this.camera.script as any).orbitCamera.focusEntity = this.gltf;
      }
    }
  }

  public pauseAnimationClips() {
    if (!this.gltf || !this.gltf.animComponent) {
      return;
    }
    this.gltf.animComponent.pauseAll();
    this.playing = false;
    // this.anim_pause.value = ">";
  }

  public playCurrentAnimationClip() {
    if (!this.gltf || !this.gltf.animComponent) {
      return;
    }
    //this.gltf.animComponent.getCurrentClip().resume(); // resume doesn't work yet
    const clip = this.gltf.animComponent.getCurrentClip();
    clip.play(); // just play it again, until resume() works
    // this.anim_slider.max = clip.duration;
    this.playing = true;
    // this.anim_pause.value = "||";
    // this.clip = clip; // quick access for f12 devtools
    // this.timeline.resize();
  }

  public resumeCurrentAnimationClip() {
    if (!this.gltf || !this.gltf.animComponent) {
      return;
    }
    const clip = this.gltf.animComponent.getCurrentClip();
    clip.resume();
    // this.anim_slider.max = clip.duration;
    this.playing = true;
    // this.anim_pause.value = "||";
    // this.clip = clip; // quick access for f12 devtools
    // this.timeline.resize();
  }

  public pauseAnimationsAndSeekToTime(curTime: number) {
    if (!this.gltf || !this.gltf.animComponent) {
      return;
    }

    // once we seek into the animation, stop the default playing
    this.pauseAnimationClips();
    // now set the seeked time for the last played clip
    const clip = this.gltf.animComponent.getCurrentClip();
    const session = clip.session;
    const self = session;
    session.curTime = curTime;
    self.showAt(
      self.curTime,
      self.fadeDir,
      self.fadeBegTime,
      self.fadeEndTime,
      self.fadeTime,
    );
    self.invokeByTime(self.curTime);
  }

  public switchToClipByName(clipName: string) {
    if (!this.gltf || !this.gltf.animComponent) {
      return;
    }

    // const clip = this.gltf.animComponent.animClipsMap[clipName];
    this.gltf.animComponent.curClip = clipName;
    this.pauseAnimationClips();
    this.playCurrentAnimationClip();
  }

  public togglePlayPauseAnimation() {
    if (this.playing) {
      this.pauseAnimationClips();
    } else {
      this.resumeCurrentAnimationClip();
    }
  }

  private registerResources(res: Resources) {
    debug("Register resources");
    // Wrap the model as an asset and add to the asset registry
    const asset = new pc.Asset("gltf", "model", {
      url: "",
    });
    asset.resource = res.model;
    asset.loaded = true;

    debug("Add model to asset library");
    this.app.assets.add(asset);

    this.asset = asset;
    this.textures = res.textures || [];
    this.animations = res.animations || [];
  }

  private async parseGltf(gltf: GlTf, basePath: string) {
    const { app } = this;
    const parser = new GlTfParser(gltf, app.graphicsDevice, {
      basePath,
    });
    const res = await parser.load();
    this.registerResources(res);
  }

  public async loadModel(url: string) {
    debug("Destroy scene");
    this.destroyScene();
    debug("Fetch glTF", url);
    const basePath = url.substring(0, url.lastIndexOf("/")) + "/";
    const res = await fetch(url);
    const gltf = await res.json();
    debug("Parse glTF");
    await this.parseGltf(gltf, basePath);
    debug("Init scene");
    this.initScene();
  }
}
