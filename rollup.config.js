import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import glslify from "rollup-plugin-glslify";

export default {
    input: "./src/init.js",
    output:{
        name:"earth",
        exports: "named",
        format:"iife",
        file:"./dist/earth.gl.js",
        sourcemap:true,
        strict:false
    },
    external: [
        "fs",
        "steam",
        "path",
        "through"
    ],
    plugins: [
        resolve(),
        commonjs(),
        glslify({ basedir: "./src/shader"}),
        babel({
            exclude: "node_modules/**"
        })
    ]
};