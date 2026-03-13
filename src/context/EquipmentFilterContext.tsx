'use client'

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import { useDataTable } from './DataTableContext' // Добавляем импорт

export type EquipmentFilterMode = 'overdue' | 'defective' | null

interface EquipmentFilterContextType {
	filterMode: EquipmentFilterMode
	filterCodes: Set<string>
	isLoading: boolean
	error: string | null
	setFilterMode: (mode: EquipmentFilterMode) => Promise<void>
	clearFilter: () => void
	onFilterChange?: (mode: EquipmentFilterMode) => void
}

const EquipmentFilterContext = createContext<
	EquipmentFilterContextType | undefined
>(undefined)

export const EquipmentFilterProvider: React.FC<{
	children: React.ReactNode
	onFilterChange?: (mode: EquipmentFilterMode) => void
}> = ({ children, onFilterChange }) => {
	const [filterMode, setFilterModeState] = useState<EquipmentFilterMode>(null)
	const [filterCodes, setFilterCodes] = useState<Set<string>>(new Set())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Получаем функцию очистки поиска из DataTableContext
	const { setSearchQuery } = useDataTable()

	const setFilterMode = useCallback(
		async (mode: EquipmentFilterMode) => {
			if (mode === filterMode) {
				// Если нажимаем на активную кнопку - сбрасываем фильтр
				setFilterModeState(null)
				setFilterCodes(new Set())
				setError(null)
				setSearchQuery('') // Очищаем поиск

				if (onFilterChange) {
					onFilterChange(null)
				}
				return
			}

			setFilterModeState(mode)
			setError(null)
			setIsLoading(true)

			try {
				const { apiService } = await import('@/lib/api/api-service')
				let codes: string[] = []

				if (mode === 'overdue') {
					codes = await apiService.getOverdueEquipment()
				} else if (mode === 'defective') {
					codes = await apiService.getDefectiveEquipment()
				}
				setFilterCodes(new Set(codes))
				setSearchQuery('') // Очищаем поиск при применении фильтра
				console.log(`✅ Загружены коды для режима ${mode}:`, codes)

				if (onFilterChange) {
					onFilterChange(mode)
				}
			} catch (err) {
				setError(`Не удалось загрузить данные для режима ${mode}`)
				console.error(`Error loading ${mode} equipment:`, err)
				setFilterModeState(null)
				setFilterCodes(new Set())

				if (onFilterChange) {
					onFilterChange(null)
				}
			} finally {
				setIsLoading(false)
			}
		},
		[filterMode, onFilterChange, setSearchQuery],
	)

	const clearFilter = useCallback(() => {
		setFilterModeState(null)
		setFilterCodes(new Set())
		setError(null)
		setSearchQuery('') // Очищаем поиск при сбросе фильтра

		if (onFilterChange) {
			onFilterChange(null)
		}
	}, [onFilterChange, setSearchQuery])

	const contextValue = useMemo(
		() => ({
			filterMode,
			filterCodes,
			isLoading,
			error,
			setFilterMode,
			clearFilter,
		}),
		[filterMode, filterCodes, isLoading, error, setFilterMode, clearFilter],
	)

	return (
		<EquipmentFilterContext.Provider value={contextValue}>
			{children}
		</EquipmentFilterContext.Provider>
	)
}

export const useEquipmentFilter = () => {
	const context = useContext(EquipmentFilterContext)
	if (!context) {
		throw new Error(
			'useEquipmentFilter must be used within EquipmentFilterProvider',
		)
	}
	return context
}
