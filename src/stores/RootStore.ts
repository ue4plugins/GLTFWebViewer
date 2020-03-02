import { ModelStore } from "./ModelStore";
import { SkyboxStore } from "./SkyboxStore";

export class RootStore {
  public modelStore = new ModelStore();
  public skyboxStore = new SkyboxStore();
}
