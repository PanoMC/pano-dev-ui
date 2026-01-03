import { setContext, getContext } from 'svelte'

export { default as PanoTestButton } from './components/Button.svelte';

export const PANO_CTX = Symbol()

export function setPanoContext(ctx) {
    setContext(PANO_CTX, ctx)
}

export function usePano() {
    return getContext(PANO_CTX)
}