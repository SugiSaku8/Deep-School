import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

export default {
    input: 'index.js',
    output: {
        file: 'dist/koodi-editor.js',
        format: 'umd',
        name: 'KoodiEditor',
        globals: {
            'codemirror': 'CodeMirror'
        }
    },
    plugins: [
        resolve(),
        commonjs(),
        postcss({
            extract: true,
            minimize: true,
            sourceMap: true
        }),
        copy({
            targets: [
                { 
                    src: 'node_modules/codemirror/theme/*.css', 
                    dest: 'dist/themes' 
                },
                { 
                    src: 'node_modules/codemirror/lib/codemirror.css', 
                    dest: 'dist' 
                }
            ]
        })
    ]
};