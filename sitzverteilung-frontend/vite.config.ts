// Plugins
import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import UnpluginFonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

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
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Sitzverteilung",
          short_name: "Sitzverteilung",
          description: "Anwendung zur Berechnung der Sitzverteilung für Wahlen",
          theme_color: "#333333",
        },
        workbox: {
          cleanupOutdatedCaches: true,
          globPatterns: ["**/*.{js,css,html,png,ico}"],
        },
        devOptions: {
          enabled: isDevelopment,
        },
        pwaAssets: {
          image: "public/logo.png",
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
