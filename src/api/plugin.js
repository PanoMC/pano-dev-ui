import { createPluginContext } from "./plugin-context.js";

export class PanoPlugin {
  static isPanoPlugin = true;
  constructor({ pluginId, scope } = {}) {
    if (!pluginId) {
      throw new Error("[PanoPlugin] pluginId is required");
    }

    // plugin-scoped context
    this.contextApi = createPluginContext(pluginId, scope);
    this.context = this.contextApi.context;

    this._unsubscribers = [];
  }

  /** lifecycle hooks */
  onLoad(pano) {}
  onUnload() {}

  /** plugin context helper */
  setContext(partial) {
    this.contextApi.set(partial);
  }

  /** internal cleanup */
  __destroy() {
    this._unsubscribers.forEach((fn) => fn());
    this.contextApi.destroy?.();
    this.onUnload();
  }
}
