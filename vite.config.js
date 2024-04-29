// created this file cause it's useful to export it compiles the node js and the js that run on browser may not be same so this allows to support the js in browsers

import { defineConfig } from "vite";

export default defineConfig({
    base: "./2d-portfolio", 
    build: {
        minify: "terser",
    },
});