import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import UnoCSS from "unocss/vite"
import Pages from "vite-plugin-pages"

export default defineConfig({
  plugins: [
    UnoCSS(),
    preact(),
    Pages({ resolver: "react", extensions: ["tsx"], exclude: ["socket.io"] })
  ]
})
