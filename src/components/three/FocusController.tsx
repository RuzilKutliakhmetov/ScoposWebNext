'use client'

import { useCustomEvent } from '@/hooks/useCustomEvent'
import { VIEWER_CONFIG } from '@/lib/config/viewerConfig'
import { logger } from '@/lib/utils/logger'
import { createSmartObjectFinder } from '@/lib/utils/scene-utils'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface FocusEventDetail {
	objectName: string
	instant?: boolean
}

export const FocusController: React.FC = () => {
	const { camera, scene } = useThree()
	const controlsRef = useRef<any>(null)
	const isAnimating = useRef(false)
	const isMounted = useRef(true)

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	// Инициализация контролов
	useEffect(() => {
		const handleControlsReady = (event: CustomEvent) => {
			controlsRef.current = event.detail?.controls
			logger.info('🎮 Контролы камеры готовы для FocusController')
		}

		window.addEventListener(
			'controls-ready',
			handleControlsReady as EventListener,
		)

		return () => {
			window.removeEventListener(
				'controls-ready',
				handleControlsReady as EventListener,
			)
		}
	}, [])

	// Создаем умный поиск с кэшированием
	const smartFindObject = useMemo(() => {
		return createSmartObjectFinder(scene)
	}, [scene])

	// Плавная анимация камеры
	const animateCamera = useCallback(
		(
			startPos: THREE.Vector3,
			endPos: THREE.Vector3,
			startTarget: THREE.Vector3,
			endTarget: THREE.Vector3,
			duration: number = 800,
		) => {
			if (isAnimating.current || !controlsRef.current || !isMounted.current)
				return

			isAnimating.current = true
			const startTime = performance.now()

			const animate = (currentTime: number) => {
				if (!isMounted.current) return

				const elapsed = currentTime - startTime
				const progress = Math.min(elapsed / duration, 1)

				const easeProgress =
					progress < 0.5
						? 2 * progress * progress
						: 1 - Math.pow(-2 * progress + 2, 2) / 2

				camera.position.lerpVectors(startPos, endPos, easeProgress)

				controlsRef.current.target.lerpVectors(
					startTarget,
					endTarget,
					easeProgress,
				)
				controlsRef.current.update()

				if (progress < 1) {
					requestAnimationFrame(animate)
				} else {
					isAnimating.current = false
				}
			}

			requestAnimationFrame(animate)
		},
		[camera],
	)

	// Главная функция фокусировки
	const focusOnObject = useCallback(
		(objectName: string, instant: boolean = false) => {
			logger.info(`🎯 Запрос фокусировки на: "${objectName}"`)

			if (!controlsRef.current) {
				logger.warn('❌ Контролы камеры не инициализированы')
				return
			}

			const targetObject = smartFindObject(objectName)

			if (!targetObject) {
				logger.info(
					`ℹ️ Объект "${objectName}" не найден, фокусировка не выполняется`,
				)
				return
			}

			logger.info(
				`✅ Объект найден: ${targetObject.name}, начинаем анимацию...`,
			)

			const currentPosition = camera.position.clone()
			const currentTarget = controlsRef.current.target.clone()

			const box = new THREE.Box3().setFromObject(targetObject)
			const center = new THREE.Vector3()
			box.getCenter(center)

			const size = new THREE.Vector3()
			box.getSize(size)
			const maxDim = Math.max(size.x, size.y, size.z)

			const directionToCamera = currentPosition.clone().sub(center).normalize()

			let direction = directionToCamera
			if (direction.length() < 0.1) {
				direction = new THREE.Vector3(0, 0.3, 1).normalize()
			}

			const desiredDistance = Math.max(
				maxDim * 2.5,
				VIEWER_CONFIG.controls.minDistance,
			)
			const finalDistance = Math.min(
				desiredDistance,
				VIEWER_CONFIG.controls.maxDistance,
			)

			const newPosition = center
				.clone()
				.add(direction.multiplyScalar(finalDistance))

			if (instant) {
				camera.position.copy(newPosition)
				controlsRef.current.target.copy(center)
				controlsRef.current.update()
				logger.info('⚡ Мгновенная фокусировка выполнена')
			} else {
				animateCamera(currentPosition, newPosition, currentTarget, center)
				logger.info('🎬 Начата плавная анимация фокусировки')
			}
		},
		[camera, smartFindObject, animateCamera],
	)

	// Подписка на события фокусировки
	useCustomEvent<FocusEventDetail>(
		'focus-on-object',
		useCallback(
			detail => {
				logger.info(`📡 Получено событие фокусировки: ${detail.objectName}`)
				focusOnObject(detail.objectName, detail.instant)
			},
			[focusOnObject],
		),
	)

	return null
}

export default FocusController
