export interface ExtensionParser {
  name: string;
  register(registry: pc.GlbExtensionRegistry): void;
  unregister(registry: pc.GlbExtensionRegistry): void;
  postParse(container: pc.ContainerResource): void;
}
