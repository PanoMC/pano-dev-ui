import { mount, unmount, hydrate } from 'svelte';

/**
 * Wraps a dynamic component import to include the correct Svelte runtime mount/unmount methods.
 * This bridges the gap between Host and Plugin runtimes.
 *
 * @param {() => Promise<any>} importer - Dynamic import function
 * @returns {() => Promise<any>} - Wrapped importer
 */
export function viewComponent(importer) {
  return async () => {
    const module = await importer();
    return {
      ...module,
      mount: (options) => mount(module.default, options),
      unmount: (instance) => unmount(instance),
      hydrate: (options) => hydrate(module.default, options),
    };
  };
}
