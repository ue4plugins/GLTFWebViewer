import * as pc from "@animech-public/playcanvas";
import { ExtensionRegistry } from "./ExtensionRegistry";

export interface ExtensionParser {
  name: string;
  register(registry: ExtensionRegistry): void;
  unregister(registry: ExtensionRegistry): void;
  postParse(container: pc.ContainerResource): void;
}
