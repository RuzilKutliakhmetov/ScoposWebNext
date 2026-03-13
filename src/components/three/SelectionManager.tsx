'use client'

import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { useSelection } from '@/context/SelectionContext'
import { emitCustomEvent, useCustomEvent } from '@/hooks/useCustomEvent'
import { VIEWER_CONFIG } from '@/lib/config/viewerConfig'
import { logger } from '@/lib/utils/logger'
import { createSmartObjectFinder } from '@/lib/utils/scene-utils'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export const SelectionManager: React.FC = () => {
	const { camera, gl, scene } = useThree()
	const { selected, select, deselect, clear, setHovered } = useSelection()
	const { filterMode, filterCodes } = useEquipmentFilter()

	const raycaster = useRef(new THREE.Raycaster())
	const mouse = useRef(new THREE.Vector2())
	const hoverTimeout = useRef<number | undefined>(undefined)
	const startPos = useRef({ x: 0, y: 0 })
	const isMounted = useRef(true)

	const selectionMap = useRef(
		new Map<
			string,
			{
				object: THREE.Object3D
				originalMaterial: THREE.Material | THREE.Material[]
			}
		>(),
	)

	const hoverMap = useRef(
		new Map<
			string,
			{
				object: THREE.Object3D
				originalMaterial: THREE.Material | THREE.Material[]
			}
		>(),
	)

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	const smartFindObject = useMemo(() => {
		return createSmartObjectFinder(scene)
	}, [scene])

	const checkObjectInFilter = useCallback(
		(objectName: string): boolean => {
			if (!filterMode || filterCodes.size === 0) return true

			const foundObject = smartFindObject(objectName)
			if (!foundObject) return false

			const objectCodes = objectName.split(/[^0-9a-zA-Z-]/).filter(Boolean)

			for (const code of objectCodes) {
				if (filterCodes.has(code)) {
					return true
				}
			}

			if (filterCodes.has(objectName)) {
				return true
			}

			return false
		},
		[filterMode, filterCodes, smartFindObject],
	)

	const canSelectObject = useCallback(
		(object: THREE.Object3D): boolean => {
			if (!filterMode || filterCodes.size === 0) return true
			return checkObjectInFilter(object.name)
		},
		[filterMode, filterCodes, checkObjectInFilter],
	)

	const getHitObject = useMemo(() => {
		let lastCheckTime = 0
		const CHECK_INTERVAL = 16

		return (event: MouseEvent): THREE.Object3D | null => {
			const now = performance.now()
			if (now - lastCheckTime < CHECK_INTERVAL) {
				return null
			}
			lastCheckTime = now

			const rect = gl.domElement.getBoundingClientRect()

			mouse.current.set(
				((event.clientX - rect.left) / rect.width) * 2 - 1,
				-((event.clientY - rect.top) / rect.height) * 2 + 1,
			)

			raycaster.current.setFromCamera(mouse.current, camera)

			const intersects = raycaster.current.intersectObjects(
				scene.children,
				true,
			)

			for (const intersect of intersects) {
				const object = intersect.object
				let current: THREE.Object3D | null = object

				while (current && !current.name) {
					current = current.parent
				}

				if (
					current &&
					current.layers.isEnabled(VIEWER_CONFIG.layers.pipeline)
				) {
					if (filterMode && filterCodes.size > 0) {
						if (canSelectObject(current)) {
							return current
						}
					} else {
						return current
					}
				}
			}

			return null
		}
	}, [camera, gl, scene, filterMode, filterCodes, canSelectObject])

	const setObjectColor = useMemo(() => {
		return (
			object: THREE.Object3D,
			color: number,
			map: Map<
				string,
				{
					object: THREE.Object3D
					originalMaterial: THREE.Material | THREE.Material[]
				}
			>,
		) => {
			if (!object || map.has(object.uuid) || !(object as THREE.Mesh).material)
				return

			const mesh = object as THREE.Mesh

			map.set(object.uuid, {
				object,
				originalMaterial: mesh.material,
			})

			const createHighlightMaterial = (
				original: THREE.Material,
			): THREE.Material => {
				if (original instanceof THREE.MeshBasicMaterial) {
					const material = original.clone()
					material.color.setHex(color)
					return material
				} else if (original instanceof THREE.MeshStandardMaterial) {
					const material = original.clone()
					material.color.setHex(color)
					material.emissive.setHex(color).multiplyScalar(0.3)
					material.emissiveIntensity = 0.3
					return material
				} else {
					return new THREE.MeshBasicMaterial({
						color: color,
						transparent: true,
						opacity: 0.7,
					})
				}
			}

			if (Array.isArray(mesh.material)) {
				mesh.material = mesh.material.map(createHighlightMaterial)
			} else {
				mesh.material = createHighlightMaterial(mesh.material as THREE.Material)
			}
		}
	}, [])

	const resetObjectColor = useMemo(() => {
		return (
			object: THREE.Object3D,
			map: Map<
				string,
				{
					object: THREE.Object3D
					originalMaterial: THREE.Material | THREE.Material[]
				}
			>,
		) => {
			const stored = map.get(object.uuid)
			if (!stored) return

			const mesh = object as THREE.Mesh
			const currentMaterial = mesh.material

			mesh.material = stored.originalMaterial
			map.delete(object.uuid)

			const disposeMaterial = (material: THREE.Material) => {
				if (material !== stored.originalMaterial) {
					material.dispose?.()
				}
			}

			if (Array.isArray(currentMaterial)) {
				const currentMaterials = currentMaterial as THREE.Material[]

				if (Array.isArray(stored.originalMaterial)) {
					const originalMaterials = stored.originalMaterial as THREE.Material[]
					currentMaterials.forEach((material, index) => {
						if (
							index < originalMaterials.length &&
							material !== originalMaterials[index]
						) {
							disposeMaterial(material)
						} else if (index >= originalMaterials.length) {
							disposeMaterial(material)
						}
					})
				} else {
					currentMaterials.forEach(disposeMaterial)
				}
			} else if (
				currentMaterial &&
				currentMaterial !== stored.originalMaterial
			) {
				if (!Array.isArray(stored.originalMaterial)) {
					disposeMaterial(currentMaterial as THREE.Material)
				} else {
					disposeMaterial(currentMaterial as THREE.Material)
				}
			}
		}
	}, [])

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (hoverTimeout.current !== undefined) {
				clearTimeout(hoverTimeout.current)
				hoverTimeout.current = undefined
			}

			const hit = getHitObject(event)

			hoverMap.current.forEach((stored, uuid) => {
				if (selectionMap.current.has(uuid)) return
				resetObjectColor(stored.object, hoverMap.current)
			})
			hoverMap.current.clear()

			setHovered(null)

			if (hit) {
				const canSelect = canSelectObject(hit)

				hoverTimeout.current = window.setTimeout(() => {
					if (canSelect && !selectionMap.current.has(hit.uuid)) {
						setObjectColor(
							hit,
							VIEWER_CONFIG.selection.hoverColor,
							hoverMap.current,
						)
						setHovered(hit.uuid)
					}
				}, VIEWER_CONFIG.selection.hoverDelay)

				gl.domElement.style.cursor = canSelect ? 'pointer' : 'not-allowed'
			} else {
				gl.domElement.style.cursor = 'default'
			}
		},
		[
			getHitObject,
			resetObjectColor,
			setObjectColor,
			setHovered,
			gl,
			canSelectObject,
		],
	)

	const selectObjectByName = useCallback(
		(objectName: string) => {
			logger.info(`🎯 Выделение объекта по имени: ${objectName}`)

			if (
				filterMode &&
				filterCodes.size > 0 &&
				!checkObjectInFilter(objectName)
			) {
				logger.warn(
					`❌ Объект "${objectName}" не соответствует активному фильтру "${filterMode}"`,
				)
				return false
			}

			const foundObject = smartFindObject(objectName)

			if (!foundObject) {
				logger.warn(`❌ Объект "${objectName}" не найден для выделения`)
				return false
			}

			const hitUuid = foundObject.uuid

			selectionMap.current.forEach((stored, uuid) => {
				resetObjectColor(stored.object, selectionMap.current)
				deselect(uuid)
			})
			selectionMap.current.clear()

			setObjectColor(
				foundObject,
				VIEWER_CONFIG.selection.selectColor,
				selectionMap.current,
			)
			select(hitUuid)

			logger.info(`✅ Объект выделен: ${foundObject.name}`)
			return true
		},
		[
			smartFindObject,
			resetObjectColor,
			setObjectColor,
			select,
			deselect,
			filterMode,
			filterCodes,
			checkObjectInFilter,
		],
	)

	useCustomEvent<{ objectName: string }>(
		'select-object',
		useCallback(
			detail => {
				logger.info(`📡 Получено событие выделения: ${detail.objectName}`)
				selectObjectByName(detail.objectName)
			},
			[selectObjectByName],
		),
	)

	const handleMouseUp = useCallback(
		(event: MouseEvent) => {
			const moveDistance = Math.hypot(
				event.clientX - startPos.current.x,
				event.clientY - startPos.current.y,
			)

			if (moveDistance > VIEWER_CONFIG.selection.moveThreshold) return

			const hit = getHitObject(event)
			const isMultiSelect = event.ctrlKey || event.metaKey

			if (hit) {
				const hitUuid = hit.uuid

				if (hoverMap.current.has(hitUuid)) {
					resetObjectColor(hit, hoverMap.current)
					hoverMap.current.delete(hitUuid)
				}
				setHovered(null)

				if (filterMode && filterCodes.size > 0 && !canSelectObject(hit)) {
					logger.info(
						`🚫 Объект "${hit.name}" не доступен для выделения при активном фильтре "${filterMode}"`,
					)
					return
				}

				if (selectionMap.current.has(hitUuid)) {
					resetObjectColor(hit, selectionMap.current)
					selectionMap.current.delete(hitUuid)
					deselect(hitUuid)
				} else {
					if (!isMultiSelect) {
						selectionMap.current.forEach((stored, uuid) => {
							resetObjectColor(stored.object, selectionMap.current)
							deselect(uuid)
						})
						selectionMap.current.clear()
					}

					setObjectColor(
						hit,
						VIEWER_CONFIG.selection.selectColor,
						selectionMap.current,
					)
					select(hitUuid)

					if (hit.name) {
						logger.info(`🎯 Клик на объект модели: ${hit.name}`)
						emitCustomEvent('open-equipment-details', { code: hit.name })
						emitCustomEvent('focus-on-object', {
							objectName: hit.name,
							instant: false,
						})
					}
				}
			} else {
				hoverMap.current.forEach(stored => {
					resetObjectColor(stored.object, hoverMap.current)
				})
				hoverMap.current.clear()
				setHovered(null)

				if (!isMultiSelect && selectionMap.current.size > 0) {
					selectionMap.current.forEach((stored, uuid) => {
						resetObjectColor(stored.object, selectionMap.current)
						deselect(uuid)
					})
					selectionMap.current.clear()
				}
			}
		},
		[
			getHitObject,
			resetObjectColor,
			setObjectColor,
			select,
			deselect,
			setHovered,
			filterMode,
			filterCodes,
			canSelectObject,
		],
	)

	const handleMouseDown = useCallback((event: MouseEvent) => {
		startPos.current = { x: event.clientX, y: event.clientY }
	}, [])

	const clearAllSelections = useCallback(() => {
		selectionMap.current.forEach(stored => {
			resetObjectColor(stored.object, selectionMap.current)
		})
		hoverMap.current.forEach(stored => {
			resetObjectColor(stored.object, hoverMap.current)
		})

		selectionMap.current.clear()
		hoverMap.current.clear()
		clear()

		if (hoverTimeout.current !== undefined) {
			clearTimeout(hoverTimeout.current)
			hoverTimeout.current = undefined
		}

		gl.domElement.style.cursor = 'default'
	}, [resetObjectColor, clear, gl])

	useEffect(() => {
		const canvas = gl.domElement

		canvas.addEventListener('mousemove', handleMouseMove)
		canvas.addEventListener('mousedown', handleMouseDown)
		canvas.addEventListener('mouseup', handleMouseUp)

		const handleResetCamera = () => clearAllSelections()
		const handleClearSelections = () => clearAllSelections()

		window.addEventListener('reset-camera', handleResetCamera)
		window.addEventListener('clear-selections', handleClearSelections)

		return () => {
			canvas.removeEventListener('mousemove', handleMouseMove)
			canvas.removeEventListener('mousedown', handleMouseDown)
			canvas.removeEventListener('mouseup', handleMouseUp)

			window.removeEventListener('reset-camera', handleResetCamera)
			window.removeEventListener('clear-selections', handleClearSelections)

			clearAllSelections()
		}
	}, [gl, handleMouseMove, handleMouseDown, handleMouseUp, clearAllSelections])

	useEffect(() => {
		selectionMap.current.forEach((stored, uuid) => {
			if (!selected.has(uuid)) {
				resetObjectColor(stored.object, selectionMap.current)
				selectionMap.current.delete(uuid)
			}
		})
	}, [selected, resetObjectColor])

	useEffect(() => {
		if (filterMode && filterCodes.size > 0) {
			logger.info(`🔄 Фильтр изменен: очищаем выделения`)
			clearAllSelections()
		}
	}, [filterMode, filterCodes, clearAllSelections])

	return null
}

export default SelectionManager
