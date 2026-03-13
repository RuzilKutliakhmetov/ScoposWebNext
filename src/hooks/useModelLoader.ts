'use client'

import { logger } from '@/lib/utils/logger'
import { assignLayers, exportPipelineObjects } from '@/lib/utils/scene-utils'

import { MeshoptDecoder } from 'meshoptimizer'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface UseModelLoaderProps {
	modelPath: string
	modelName: string
}

interface UseModelLoaderReturn {
	model: THREE.Group | null
	loading: boolean
	progress: number
	error: string | null
	reset: () => void
}

export const useModelLoader = ({
	modelPath,
	modelName,
}: UseModelLoaderProps): UseModelLoaderReturn => {
	const [model, setModel] = useState<THREE.Group | null>(null)
	const [loading, setLoading] = useState(true)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const isLoadingRef = useRef(false)
	const abortControllerRef = useRef<AbortController | null>(null)
	const mountedRef = useRef(true)

	const reset = useCallback(() => {
		setModel(null)
		setLoading(true)
		setProgress(0)
		setError(null)
	}, [])

	useEffect(() => {
		mountedRef.current = true

		// Отменяем предыдущую загрузку
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		abortControllerRef.current = new AbortController()

		let loader: GLTFLoader | null = null

		const loadModel = async () => {
			if (isLoadingRef.current || !mountedRef.current) return

			// Сбрасываем состояние
			if (mountedRef.current) {
				reset()
			}

			isLoadingRef.current = true

			try {
				if (!mountedRef.current) return
				logger.info(`🚀 Загрузка 3D модели: ${modelPath}`)

				loader = new GLTFLoader()

				// Динамический импорт meshoptimizer decoder если нужно
				if (MeshoptDecoder) {
					loader.setMeshoptDecoder(MeshoptDecoder)
				}

				const gltf = await new Promise<THREE.Group>((resolve, reject) => {
					if (!loader) return reject(new Error('Loader not initialized'))

					loader.load(
						modelPath,
						gltf => {
							if (mountedRef.current) resolve(gltf.scene)
						},
						xhr => {
							if (mountedRef.current) {
								const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0
								setProgress(progress)
							}
						},
						error => {
							if (!abortControllerRef.current?.signal.aborted) {
								reject(error)
							}
						},
					)
				})

				if (!mountedRef.current) return

				assignLayers(gltf)
				setModel(gltf)
				setLoading(false)

				if (process.env.NODE_ENV === 'development') {
					exportPipelineObjects(gltf)
				}

				logger.info(`✅ Модель ${modelName} успешно загружена`)
			} catch (error: any) {
				if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
					logger.error('❌ Ошибка загрузки:', error)
					setError(`Не удалось загрузить модель ${modelName}.`)
					setLoading(false)
				}
			} finally {
				isLoadingRef.current = false
			}
		}

		loadModel()

		return () => {
			mountedRef.current = false
			isLoadingRef.current = false

			if (loader) {
				loader.manager.itemStart = () => {}
				loader.manager.itemEnd = () => {}
				loader.manager.itemError = () => {}
				loader = null
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [modelPath, modelName, reset])

	return { model, loading, progress, error, reset }
}
