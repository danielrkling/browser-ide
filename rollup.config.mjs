import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/app.tsx',
	external: [
		'react',
		'react-dom',
		'react-dom/client',
		'monaco-editor',
		'@tanstack/react-query'],
	
	output: {
		dir: 'dist',
		format: 'iife',
		globals:{
			'react':'React',
			'react-dom':'ReactDOM',
			'react-dom/client':'ReactDOM',
			'monaco-editor':'monaco',
			'@tanstack/react-query':'ReactQuery'
		}
	},
    plugins: [typescript()]
};