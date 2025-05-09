// Plugins
import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import UnpluginFonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";
  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
        features: {
          optionsAPI: isDevelopment,
        },
      }),
      vuetify(),
      UnpluginFonts({
        fontsource: {
          families: [
            {
              name: "Roboto",
              weights: [100, 300, 400, 500, 700, 900],
              subset: "latin",
            },
          ],
        },
      }),
      vueDevTools(),
    ],
    server: {
      host: true,
      port: 8081,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
