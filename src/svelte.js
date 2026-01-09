import { getPanoContext } from './internal/index.js';

const panoContext = getPanoContext();
const { page, base, navigating, browser, goto } = panoContext.context;

export { page, base, navigating, browser, goto };
