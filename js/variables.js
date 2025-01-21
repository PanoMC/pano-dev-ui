export const API_URL = import.meta.env.VITE_API_URL;
export const UI_URL = import.meta.env.VITE_UI_URL;
export const PANEL_URL = import.meta.env.VITE_PANEL_URL;
export const SETUP_URL = import.meta.env.VITE_SETUP_URL;
export const PANO_WEBSITE_URL = import.meta.env.VITE_PANO_WEBSITE_URL;

export const COOKIE_PREFIX = import.meta.env.VITE_COOKIE_PREFIX;

export const CSRF_TOKEN_COOKIE_NAME = "csrf_token";
export const JWT_COOKIE_NAME = "auth_token";

export const CSRF_HEADER = "X-CSRF-Token";

export const PLUGIN_DEV_MODE =
  import.meta.env.VITE_PLUGIN_DEV_MODE?.toLowerCase() === "true";
