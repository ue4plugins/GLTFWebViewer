import * as pc from "@animech-public/playcanvas";
import { ExtensionRegistry } from "./ExtensionRegistry";

export interface ExtensionParser {
  /**
   * Name of the extension.
   */
  name: string;

  /**
   * Bind processing callbacks for this extension.
   * @param registry Registry used in parser.
   */
  register(registry: ExtensionRegistry): void;

  /**
   * Unbind processing callbacks for this extension.
   * @param registry Registry used in parser.
   */
  unregister(registry: ExtensionRegistry): void;

  /**
   * Called when the whole glTF file has been successfully parsed.
   * @param container Result of the parsed file.
   */
  postParse(container: pc.ContainerResource): void;
}
