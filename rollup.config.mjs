import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/app.tsx',
	external: ['react','react-dom','monaco-editor'],
	output: {
		dir: 'dist',
		format: 'iife',
		globals:{
			'react':'React',
			'react-dom':'ReactDOM',
			'monaco-editor':'monaco'
		}
	},
    plugins: [typescript()]
};