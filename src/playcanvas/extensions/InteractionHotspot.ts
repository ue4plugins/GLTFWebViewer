import pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";

const debug = Debug("InteractionHotspot");

type InteractionHotspotData = {
  animation: 0;
  image: 0;
};

export class InteractionHotspotExtensionParser implements ExtensionParser {
  private _hotspots: {
    node: pc.Entity;
    data: InteractionHotspotData;
  }[] = [];

  public get name() {
    return "EPIC_interaction_hotspots";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.node.add(this.name, this._parse.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse hotspot", container);
    this._hotspots.forEach(hotspot => {
      const image = container.textures[hotspot.data.image];
      const animation = container.animations[hotspot.data.animation];
      debug("Found image and animation", image, animation);
    });
  }

  private _parse(node: pc.Entity, extension: any, gltf: any) {
    debug("Parse hotspot", node, extension);

    const hotspots: InteractionHotspotData[] | undefined =
      gltf?.extensions?.[this.name]?.interactions;
    if (!hotspots) {
      return node;
    }

    const hotspot = hotspots[extension.interaction];
    if (!hotspot) {
      return node;
    }

    debug("Found hotspot", hotspot);

    // TODO: remove this test implementation
    const child = new pc.Entity();
    child.rotateLocal(45, 45, 45);
    child.setLocalScale(2, 2, 2);
    child.addComponent("model", {
      type: "box",
    });
    const material = child.model!.material as pc.StandardMaterial;
    material.diffuse.fromString("ff0ff0");
    material.update();

    node.addChild(child);

    this._hotspots.push({
      node,
      data: hotspot,
    });

    return node;
  }
}
