import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte()],
    build: {
        lib: {
            entry: "src/index.js",
            formats: ["es"],
            fileName: () => "index.js"
        },
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            external: ["svelte"]
        }
    },
    resolve: {
        dedupe: ["svelte"]
    }
});
