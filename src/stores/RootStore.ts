import { ModelStore } from "./ModelStore";
import { SceneStore } from "./SceneStore";

export class RootStore {
  public modelStore = new ModelStore();
  public sceneStore = new SceneStore();
}
