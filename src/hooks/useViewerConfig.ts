'use client'

import { VIEWER_CONFIG } from '@/lib/config/viewerConfig'
import { useEffect, useMemo, useState } from 'react'

export const useViewerConfig = () => {
	const [showGrid, setShowGrid] = useState<boolean>(VIEWER_CONFIG.ui.showGrid)

	// Загружаем настройки из localStorage только на клиенте
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedShowGrid = localStorage.getItem('viewer-show-grid')
			if (storedShowGrid !== null) {
				setShowGrid(storedShowGrid === 'true')
			}
		}
	}, [])

	// Сохраняем настройки в localStorage при изменении
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('viewer-show-grid', String(showGrid))
		}
	}, [showGrid])

	const config = useMemo(() => {
		return {
			...VIEWER_CONFIG,
			ui: {
				...VIEWER_CONFIG.ui,
				showGrid,
			},
			// Метод для обновления showGrid
			setShowGrid: (value: boolean) => {
				setShowGrid(value)
			},
		}
	}, [showGrid])

	return config
}

// Альтернативная версия с отдельными геттерами/сеттерами
export const useViewerConfigSimple = () => {
	return useMemo(() => {
		// Проверяем наличие window для SSR
		if (typeof window === 'undefined') {
			return VIEWER_CONFIG
		}

		const storedShowGrid = localStorage.getItem('viewer-show-grid')

		return {
			...VIEWER_CONFIG,
			ui: {
				...VIEWER_CONFIG.ui,
				showGrid:
					storedShowGrid !== null
						? storedShowGrid === 'true'
						: VIEWER_CONFIG.ui.showGrid,
			},
		}
	}, []) // Пустой массив зависимостей - конфиг не меняется после монтирования
}
