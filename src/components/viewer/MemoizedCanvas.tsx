'use client'

import { emitCustomEvent } from '@/hooks/useCustomEvent'
import { useViewerConfig } from '@/hooks/useViewerConfig'
import { logger } from '@/lib/utils/logger'
import { Canvas } from '@react-three/fiber'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'

interface MemoizedCanvasProps {
	children: React.ReactNode
}

export const MemoizedCanvas = memo(({ children }: MemoizedCanvasProps) => {
	const config = useViewerConfig()

	const cameraConfig = useMemo(
		() => ({
			position: config.camera.position as [number, number, number],
			fov: config.camera.fov,
			near: config.camera.near,
			far: config.camera.far,
		}),
		[config.camera],
	)

	const glConfig = useMemo(
		() => ({
			antialias: config.rendering.antialias,
			outputColorSpace: config.rendering.outputColorSpace as THREE.ColorSpace,
			powerPreference: 'high-performance' as const,
			preserveDrawingBuffer: true,
			alpha: false,
			stencil: false,
			depth: true,
		}),
		[config.rendering],
	)

	const onCanvasCreated = useMemo(
		() =>
			(props: {
				camera: THREE.Camera
				scene: THREE.Scene
				gl: THREE.WebGLRenderer
			}) => {
				const { camera, scene } = props

				// Настройка слоев камеры
				Object.values(config.layers).forEach(layer => {
					camera.layers.enable(layer)
				})

				// Установка целевой точки камеры
				if (camera instanceof THREE.PerspectiveCamera) {
					camera.lookAt(...config.camera.target)
				}

				// Добавление камеры в сцену (необходимо для дочерних элементов)
				scene.add(camera)

				logger.info('🎥 Камера инициализирована')
				emitCustomEvent('scene-ready', { scene })
			},
		[config.camera.target, config.layers],
	)

	return (
		<Canvas
			camera={cameraConfig}
			onCreated={onCanvasCreated}
			gl={glConfig}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				outline: 'none',
			}}
			dpr={[1, 2]} // Адаптивный pixel ratio для производительности
			performance={{ min: 0.5 }} // Минимальная производительность
		>
			{children}
		</Canvas>
	)
})

MemoizedCanvas.displayName = 'MemoizedCanvas'
