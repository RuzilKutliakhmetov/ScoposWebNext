import { EquipmentFilterMode } from '@/context/EquipmentFilterContext'
import { emitCustomEvent } from '@/hooks/useCustomEvent'
import { LAYERS } from '@/lib/config/viewerConfig'
import * as THREE from 'three'

export const assignLayers = (object: THREE.Object3D, isBackground = false) => {
	const name = object.name || ''
	const isBg = isBackground || name.includes('*')

	if (/^\d/.test(name)) {
		object.layers.set(LAYERS.PIPELINE)
	} else if (isBg) {
		object.layers.set(LAYERS.BACKGROUND)
	} else {
		object.layers.set(LAYERS.OTHERS)
	}

	object.children.forEach(child => assignLayers(child, isBg))
}

export const exportPipelineObjects = (scene: THREE.Group): string[] => {
	const pipelineObjects: string[] = []

	scene.traverse(object => {
		if (object.layers.isEnabled(LAYERS.PIPELINE)) {
			if (object.name && object.name.trim() !== '') {
				pipelineObjects.push(object.name)
			}
		}
	})

	console.log('🎯 Объекты слоя PIPELINE:', pipelineObjects)
	return pipelineObjects
}

export const createHighlightMaterial = (color: number, opacity = 0.5) => {
	return new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity,
		depthTest: true,
		depthWrite: false,
	})
}

/**
 * Найти объект по имени в сцене
 */
export const findObjectByName = (
	scene: THREE.Object3D,
	name: string,
): THREE.Object3D | null => {
	let foundObject: THREE.Object3D | null = null

	scene.traverse(object => {
		if (object.name === name) {
			foundObject = object
		}
	})

	return foundObject
}

/**
 * Получить ограничивающий бокс объекта с учетом всех его потомков
 */
export const getBoundingBox = (object: THREE.Object3D): THREE.Box3 => {
	const box = new THREE.Box3()
	box.setFromObject(object)
	return box
}

/**
 * Получить центр ограничивающего бокса
 */
export const getBoundingBoxCenter = (object: THREE.Object3D): THREE.Vector3 => {
	const box = getBoundingBox(object)
	const center = new THREE.Vector3()
	box.getCenter(center)
	return center
}

/**
 * Получить размер ограничивающего бокса
 */
export const getBoundingBoxSize = (object: THREE.Object3D): THREE.Vector3 => {
	const box = getBoundingBox(object)
	const size = new THREE.Vector3()
	box.getSize(size)
	return size
}

/**
 * Рассчитать позицию камеры для фокусировки на объекте
 */
export const calculateCameraPosition = (
	targetPosition: THREE.Vector3,
	objectSize: THREE.Vector3,
	camera: THREE.PerspectiveCamera,
): THREE.Vector3 => {
	const maxDimension = Math.max(objectSize.x, objectSize.y, objectSize.z)

	// Рассчитываем расстояние на основе размера объекта и поля зрения камеры
	const distance = (maxDimension * 2) / Math.tan((camera.fov * Math.PI) / 360)

	// Смещаем камеру назад и немного вверх для лучшего обзора
	const offset = new THREE.Vector3(0, 0.3, 1)
		.normalize()
		.multiplyScalar(distance)

	return new THREE.Vector3().copy(targetPosition).add(offset)
}

/**
 * Умный поиск объекта по имени с кэшированием
 */
export const createSmartObjectFinder = (scene: THREE.Object3D) => {
	const searchCache = new Map<string, THREE.Object3D | null>()
	const cacheTimeout = 60000 // 1 минута

	return (searchName: string): THREE.Object3D | null => {
		// Проверить кэш
		if (searchCache.has(searchName)) {
			return searchCache.get(searchName)!
		}

		let foundObject: THREE.Object3D | null = null
		const searchLower = searchName.toLowerCase()

		// 1. Точное совпадение
		scene.traverse((object: THREE.Object3D) => {
			if (object.name && object.name.toLowerCase() === searchLower) {
				foundObject = object
			}
		})

		if (!foundObject) {
			// 2. Частичное совпадение
			scene.traverse((object: THREE.Object3D) => {
				if (object.name && object.name.toLowerCase().includes(searchLower)) {
					foundObject = object
				}
			})
		}

		if (!foundObject) {
			// 3. Поиск по числам
			const numbersInSearch = searchName.match(/\d+/g)
			if (numbersInSearch) {
				for (const number of numbersInSearch) {
					scene.traverse((object: THREE.Object3D) => {
						if (object.name && object.name.includes(number) && !foundObject) {
							foundObject = object
						}
					})
					if (foundObject) break
				}
			}
		}

		// Сохранить в кэш
		searchCache.set(searchName, foundObject)

		// Очистить кэш через время
		setTimeout(() => searchCache.delete(searchName), cacheTimeout)

		return foundObject
	}
}

export const getObjectCenter = (object: THREE.Object3D): THREE.Vector3 => {
	const box = new THREE.Box3().setFromObject(object)
	const center = new THREE.Vector3()
	box.getCenter(center)
	return center
}

export const resetAllSelections = () => {
	console.log('🔄 Сброс всех выделений и состояний')

	// 1. Сбрасываем выделение в 3D сцене
	emitCustomEvent('clear-selections')
}

export const handleFilterChange = (
	newFilterMode: EquipmentFilterMode | null,
	setSelectedEquipmentCode: (code: string | undefined) => void,
) => {
	console.log(`🔄 Обработка изменения фильтра: ${newFilterMode}`)

	// 1. Сбрасываем выделение
	resetAllSelections()

	// 2. Сбрасываем выбранное оборудование
	setSelectedEquipmentCode(undefined)

	// 3. Возвращаемся к основному виду
	// (если был открыт детальный просмотр - вернемся к таблице)
}
