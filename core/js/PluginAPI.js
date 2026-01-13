import { base } from '$app/paths';
import { registeredPages } from './PluginManager.js';

const isPanel = base === '/panel';

export const baseAPI = {
  isPanel,
  debug: false,
};

export const pageAPI = {
  page: {
    register(
      page = {
        path: '',
        component: Promise,
        systemLayout: String,
        restLayout: Boolean,
      },
    ) {
      registeredPages[page.path] = page;
      console.log(`Registered page '${page.path}'`);
    },
    unregister(path = '') {
      delete registeredPages[path];
      console.log(`Unregistered page '${path}'`);
    },
    isPluginPage: (path = '') => registeredPages[path] !== undefined,
  },
};
