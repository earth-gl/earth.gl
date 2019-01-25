const { watch: gulpwatch } = require('gulp');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const glslify = require('rollup-plugin-glslify');

const watch = ()=>{
    const watcher = gulpwatch(['./src/**/*.js','./src/shader/**/*.glsl']);
    watcher.on('change', function(path) {
        console.log(`File ${path} was changed`);
        build();
    });
};

const build = () => {
    return rollup.rollup({
        input: './src/init.js',
        external: [
            'fs',
            'steam',
            'path',
            'through'
        ],
        plugins: [
            resolve(),
            commonjs(),
            glslify({ basedir: './src/shader'}),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }).then(bundle => {
        return bundle.write({
            file: './dist/earth.gl.js',
            exports: 'named',
            format: 'iife',
            name: 'earth',
            sourcemap: true,
            strict:false
        });
    });
};

//only build
exports.build = build;
//wath and build
exports.watch = watch;