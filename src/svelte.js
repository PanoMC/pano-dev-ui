import { getPanoContext } from './internal/index.js';

const panoContext = getPanoContext();
const { page, base, navigating, browser } = panoContext.context;

export { page, base, navigating, browser };
