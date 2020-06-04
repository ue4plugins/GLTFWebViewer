import pc from "@animech-public/playcanvas";
import { ExtensionHandler } from "./ExtensionHandler";

type InteractionHotspotData = {
  animation: 0;
  image: 0;
};

export class InteractionHotspotExtensionHandler implements ExtensionHandler {
  private _interactions: {
    node: pc.Entity;
    data: InteractionHotspotData;
  }[] = [];

  public get name() {
    return "EPIC_interaction_hotspots";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.node.add(this.name, this._process.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postProcess(container: pc.ContainerResource) {
    this._interactions.forEach(interaction => {
      const image = container.textures[interaction.data.image];
      const animation = container.animations[interaction.data.animation];
      console.log(this.name, "postProcess", image, animation);
    });
  }

  private _process(node: pc.Entity, extension: any, gltf: any) {
    const interactions: InteractionHotspotData[] | undefined =
      gltf?.extensions?.[this.name]?.interactions;
    if (!interactions) {
      return node;
    }

    const interaction = interactions[extension.interaction];
    if (!interaction) {
      return node;
    }

    console.log(this.name, "_process", interaction);

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

    this._interactions.push({
      node,
      data: interaction,
    });

    return node;
  }
}
