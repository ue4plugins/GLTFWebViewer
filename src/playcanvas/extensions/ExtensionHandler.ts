export interface ExtensionHandler {
  name: string;
  register(registry: pc.GlbExtensionRegistry): void;
  unregister(registry: pc.GlbExtensionRegistry): void;
  postProcess(container: pc.ContainerResource): void;
}
