'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const RenderOptimization = () => {
	const { gl, scene, camera } = useThree()
	const needsRender = useRef(false)
	const lastRenderTime = useRef(0)
	const targetFPS = 60
	const frameTime = 1000 / targetFPS
	const isMounted = useRef(true)

	const stats = useRef({
		frames: 0,
		lastTime: 0,
		fps: 0,
	})

	const isDev = process.env.NODE_ENV === 'development'

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	useFrame(() => {
		const now = performance.now()

		if (now - lastRenderTime.current < frameTime) {
			return
		}

		lastRenderTime.current = now

		if (needsRender.current && isMounted.current) {
			gl.render(scene, camera)
			needsRender.current = false
		}

		if (isDev) {
			stats.current.frames++
			const timeNow = performance.now()
			if (timeNow - stats.current.lastTime >= 1000) {
				stats.current.fps = Math.round(
					(stats.current.frames * 1000) / (timeNow - stats.current.lastTime),
				)
				stats.current.frames = 0
				stats.current.lastTime = timeNow
			}
		}
	})

	useEffect(() => {
		const onSceneChange = () => {
			needsRender.current = true
		}

		const traverseAndAddListeners = () => {
			scene.traverse(obj => {
				obj.addEventListener('added', onSceneChange)
				obj.addEventListener('removed', onSceneChange)
			})
		}

		traverseAndAddListeners()

		const onObjectAdded = (event: THREE.Event) => {
			const obj = event.target as THREE.Object3D
			obj.addEventListener('added', onSceneChange)
			obj.addEventListener('removed', onSceneChange)
		}

		scene.addEventListener('added', onObjectAdded)

		return () => {
			scene.traverse(obj => {
				obj.removeEventListener('added', onSceneChange)
				obj.removeEventListener('removed', onSceneChange)
			})

			scene.removeEventListener('added', onObjectAdded)
		}
	}, [scene])

	return null
}

export default RenderOptimization
