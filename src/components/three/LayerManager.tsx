'use client'

import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { VIEWER_CONFIG } from '@/lib/config/viewerConfig'
import { logger } from '@/lib/utils/logger'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

interface LayerManagerProps {
	isPipelineMode: boolean
	showBackground: boolean
}

export const LayerManager = ({
	isPipelineMode,
	showBackground,
}: LayerManagerProps) => {
	const { camera } = useThree()
	const { filterMode } = useEquipmentFilter()

	useEffect(() => {
		if (!camera) return

		logger.info('🔄 Обновление слоев:', {
			isPipelineMode,
			showBackground,
			filterMode,
		})

		if (filterMode) {
			camera.layers.enable(VIEWER_CONFIG.layers.pipeline)
			camera.layers.disable(VIEWER_CONFIG.layers.background)
			camera.layers.disable(VIEWER_CONFIG.layers.others)
		} else if (isPipelineMode) {
			camera.layers.enable(VIEWER_CONFIG.layers.pipeline)
			camera.layers.disable(VIEWER_CONFIG.layers.background)
			camera.layers.disable(VIEWER_CONFIG.layers.others)
		} else {
			camera.layers.enable(VIEWER_CONFIG.layers.pipeline)
			camera.layers.enable(VIEWER_CONFIG.layers.others)

			if (showBackground) {
				camera.layers.enable(VIEWER_CONFIG.layers.background)
			} else {
				camera.layers.disable(VIEWER_CONFIG.layers.background)
			}
		}
	}, [camera, isPipelineMode, showBackground, filterMode])

	return null
}

export default LayerManager
