export let API_URL = import.meta.env.VITE_API_URL;
export const UI_URL = import.meta.env.VITE_UI_URL;
export const PANEL_URL = import.meta.env.VITE_PANEL_URL;
export const SETUP_URL = import.meta.env.VITE_SETUP_URL;
export let PANO_WEBSITE_URL = import.meta.env.VITE_PANO_WEBSITE_URL;
export let PANO_WEBSITE_API_URL = import.meta.env.VITE_PANO_WEBSITE_API_URL;
export const PRERELEASE = import.meta.env.VITE_PRERELEASE;

export const COOKIE_PREFIX = import.meta.env.VITE_COOKIE_PREFIX;

export const CSRF_TOKEN_COOKIE_NAME = "csrf_token";
export const JWT_COOKIE_NAME = "auth_token";

export const CSRF_HEADER = "X-CSRF-Token";

export function updateApiUrl(apiUrl) {
  API_URL = apiUrl
}

export function updatePanoWebsiteUrl(panoWebsiteUrl) {
  PANO_WEBSITE_URL = panoWebsiteUrl
}

export function updatePanoWebsiteApiUrl(panoWebsiteApiUrl) {
  PANO_WEBSITE_API_URL = panoWebsiteApiUrl
}