import { getPanoContext } from "../internal/index.js";

const panoContext = getPanoContext();
const authStuff = panoContext.context.utils.api;

const hasPermission = authStuff.hasPermission;

export { hasPermission };
