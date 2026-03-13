'use client'

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
} from 'react'

import { emitCustomEvent } from '@/hooks/useCustomEvent'
import { EquipmentDetails, EquipmentItem } from '@/types/api'

interface DataTableState {
	equipmentList: EquipmentItem[]
	selectedEquipment: EquipmentDetails | null
	loading: boolean
	error: string | null
	searchQuery: string
	tableState: {
		search: string
		sort: any
		pagination: { pageIndex: number; pageSize: number }
	}
}

type DataTableAction =
	| { type: 'SET_EQUIPMENT_LIST'; payload: EquipmentItem[] }
	| { type: 'SET_SELECTED_EQUIPMENT'; payload: EquipmentDetails | null }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'CLEAR_SELECTION' }
	| { type: 'SET_SEARCH_QUERY'; payload: string }
	| {
			type: 'SET_TABLE_STATE'
			payload: {
				search: string
				sort: any
				pagination: { pageIndex: number; pageSize: number }
			}
	  }

const initialState: DataTableState = {
	equipmentList: [],
	selectedEquipment: null,
	loading: true,
	error: null,
	searchQuery: '',
	tableState: {
		search: '',
		sort: null,
		pagination: { pageIndex: 0, pageSize: 20 },
	},
}

const dataTableReducer = (
	state: DataTableState,
	action: DataTableAction,
): DataTableState => {
	switch (action.type) {
		case 'SET_EQUIPMENT_LIST':
			return { ...state, equipmentList: action.payload }
		case 'SET_SELECTED_EQUIPMENT':
			return { ...state, selectedEquipment: action.payload }
		case 'SET_LOADING':
			return { ...state, loading: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'CLEAR_SELECTION':
			// Убираем emitCustomEvent из редьюсера
			return { ...state, selectedEquipment: null }
		case 'SET_SEARCH_QUERY':
			return { ...state, searchQuery: action.payload }
		case 'SET_TABLE_STATE':
			return {
				...state,
				tableState: action.payload,
				searchQuery: action.payload.search,
			}
		default:
			return state
	}
}

const DataTableContext = createContext<{
	state: DataTableState
	dispatch: React.Dispatch<DataTableAction>
	setSearchQuery: (query: string) => void
	saveTableState: (search: string, sort: any, pagination: any) => void
	clearSelection: () => void
	fetchEquipmentList: () => Promise<void>
	selectEquipment: (modelCode: string) => Promise<void>
} | null>(null)

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(dataTableReducer, initialState)

	// Используем ref для отслеживания первого рендера
	const initialRender = useRef(true)

	// Вызываем событие в useEffect, а не во время рендера
	useEffect(() => {
		if (!initialRender.current && state.selectedEquipment === null) {
			// Проверяем, что это действительно очистка, а не инициализация
			emitCustomEvent('clear-selections')
		}
		initialRender.current = false
	}, [state.selectedEquipment])

	const setSearchQuery = useCallback(
		(query: string) => {
			dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
			dispatch({
				type: 'SET_TABLE_STATE',
				payload: {
					...state.tableState,
					search: query,
					pagination: { ...state.tableState.pagination, pageIndex: 0 },
				},
			})
		},
		[state.tableState],
	)

	const saveTableState = useCallback(
		(search: string, sort: any, pagination: any) => {
			dispatch({
				type: 'SET_TABLE_STATE',
				payload: { search, sort, pagination },
			})
		},
		[],
	)

	const clearSelection = useCallback(() => {
		dispatch({ type: 'CLEAR_SELECTION' })
		// Событие будет вызвано в useEffect
	}, [])

	const fetchEquipmentList = useCallback(async () => {
		dispatch({ type: 'SET_LOADING', payload: true })
		dispatch({ type: 'SET_ERROR', payload: null })
		try {
			const { apiService } = await import('@/lib/api/api-service')
			const data = await apiService.getAllEquipment()
			dispatch({ type: 'SET_EQUIPMENT_LIST', payload: data })
		} catch (err) {
			dispatch({
				type: 'SET_ERROR',
				payload: 'Не удалось загрузить список оборудования',
			})
			console.error('Ошибка загрузки:', err)
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false })
		}
	}, [])

	const selectEquipment = useCallback(async (modelCode: string) => {
		try {
			const { apiService } = await import('@/lib/api/api-service')
			const details = await apiService.getEquipmentByModelCode(modelCode)
			dispatch({ type: 'SET_SELECTED_EQUIPMENT', payload: details })
		} catch (err) {
			dispatch({ type: 'SET_SELECTED_EQUIPMENT', payload: null })
		}
	}, [])

	return (
		<DataTableContext.Provider
			value={{
				state,
				dispatch,
				setSearchQuery,
				saveTableState,
				clearSelection,
				fetchEquipmentList,
				selectEquipment,
			}}
		>
			{children}
		</DataTableContext.Provider>
	)
}

export const useDataTable = () => {
	const context = useContext(DataTableContext)
	if (!context) {
		throw new Error('useDataTable must be used within DataTableProvider')
	}
	return context
}
