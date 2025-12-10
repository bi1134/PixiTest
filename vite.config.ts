import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { assetpackPlugin } from "./scripts/assetpack-vite-plugin"; // keep your asset plugin!

export default defineConfig({
  plugins: [
    mkcert(),           // Enables HTTPS for local dev (self-signed certificate)
    assetpackPlugin(),  // Keeps PixiJS asset manifest generation
  ],
  server: {
    https: true,  // important! enables HTTPS dev server
    port: 8080,
    open: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
