'use client'

import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { logger } from '@/lib/utils/logger'
import { createSmartObjectFinder } from '@/lib/utils/scene-utils'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export const EquipmentFilterManager: React.FC = () => {
	const { scene } = useThree()
	const { filterMode, filterCodes } = useEquipmentFilter()

	// Создаем умный поиск объектов
	const smartFindObject = useMemo(() => {
		return createSmartObjectFinder(scene)
	}, [scene])

	// Материал для выделенных объектов
	const highlightMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: filterMode === 'overdue' ? 0xff0000 : 0xffa500,
			transparent: true,
			opacity: 0.7,
			depthWrite: true,
		})
	}, [filterMode])

	// Материал для заблокированных объектов
	const blockedMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: 0x444444,
			transparent: true,
			opacity: 0.3,
			depthWrite: true,
		})
	}, [])

	// Карта для хранения оригинальных материалов
	const originalMaterials = useRef(
		new Map<string, THREE.Material | THREE.Material[]>(),
	)

	// Применяем фильтрацию к объектам сцены
	useEffect(() => {
		if (filterMode === null || filterCodes.size === 0) {
			// Сбрасываем все изменения
			originalMaterials.current.forEach((material, uuid) => {
				const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
				if (obj && obj.material) {
					obj.material = material
				}
			})
			originalMaterials.current.clear()
			return
		}

		logger.info(
			`🎯 Применение фильтра ${filterMode} для ${filterCodes.size} кодов`,
		)

		// Сначала сбрасываем предыдущие изменения
		originalMaterials.current.forEach((material, uuid) => {
			const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
			if (obj && obj.material) {
				obj.material = material
			}
		})
		originalMaterials.current.clear()

		let highlightedCount = 0
		let blockedCount = 0

		const checkObjectAgainstFilter = (objectName: string): boolean => {
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
		}

		scene.traverse((object: THREE.Object3D) => {
			if (!object.name || !(object instanceof THREE.Mesh)) {
				return
			}

			const mesh = object as THREE.Mesh

			if (!originalMaterials.current.has(mesh.uuid)) {
				originalMaterials.current.set(mesh.uuid, mesh.material)
			}

			const matchesFilter = checkObjectAgainstFilter(object.name)

			if (matchesFilter) {
				mesh.material = highlightMaterial
				highlightedCount++
			} else {
				mesh.material = blockedMaterial
				blockedCount++
			}
		})

		logger.info(
			`✅ Применен фильтр: ${highlightedCount} выделено, ${blockedCount} заблокировано`,
		)

		return () => {
			originalMaterials.current.forEach((material, uuid) => {
				const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
				if (obj && obj.material) {
					obj.material = material
				}
			})
			originalMaterials.current.clear()
		}
	}, [
		filterMode,
		filterCodes,
		scene,
		smartFindObject,
		highlightMaterial,
		blockedMaterial,
	])

	return null
}

export default EquipmentFilterManager
