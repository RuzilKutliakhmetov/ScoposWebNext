import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactCompiler: true,

	// Turbopack на верхнем уровне (не внутри experimental)
	turbopack: {
		rules: {
			// Правила для загрузки 3D моделей
			'*.glb': {
				loaders: ['file-loader'],
				as: '*.glb',
			},
			'*.gltf': {
				loaders: ['file-loader'],
				as: '*.gltf',
			},
		},
		// Опционально: настройка resolve alias
		resolveAlias: {
			'@': './src',
		},
	},

	// Транспиляция three.js модулей
	transpilePackages: ['three'],

	// Настройки изображений
	images: {
		domains: ['localhost'],
		unoptimized: true,
	},
}

export default nextConfig
