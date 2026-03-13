'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDataTable } from '@/context/DataTableContext'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { cn } from '@/lib/utils/utils'

import { AlertOctagon, Clock, Search, X } from 'lucide-react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

const EquipmentFilterBarComponent: React.FC = () => {
	const { filterMode, filterCodes, isLoading, setFilterMode, clearFilter } =
		useEquipmentFilter()
	const { state, setSearchQuery } = useDataTable()
	const [localSearch, setLocalSearch] = useState(state.searchQuery)
	const debounceTimerRef = useRef<number>(0)

	useEffect(() => {
		setLocalSearch(state.searchQuery)
	}, [state.searchQuery])

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value
			setLocalSearch(value)

			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			debounceTimerRef.current = window.setTimeout(() => {
				setSearchQuery(value)
			}, 300)
		},
		[setSearchQuery],
	)

	const handleClearSearch = useCallback(() => {
		setLocalSearch('')
		setSearchQuery('')
	}, [setSearchQuery])

	const handleFilterClick = useCallback(
		(mode: 'overdue' | 'defective') => {
			setFilterMode(mode)
		},
		[setFilterMode],
	)

	const handleClearFilter = useCallback(() => {
		clearFilter()
		setLocalSearch('')
		setSearchQuery('')
	}, [clearFilter, setSearchQuery])

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	return (
		<div className='p-4 border-b border-gray-800 flex items-center gap-2 flex-wrap bg-gray-950/50'>
			{/* Кнопки фильтров */}
			<Button
				variant={filterMode === 'overdue' ? 'default' : 'outline'}
				onClick={() => handleFilterClick('overdue')}
				disabled={isLoading}
				className={cn(
					'min-w-40 justify-start gap-2',
					filterMode === 'overdue' &&
						'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
				)}
			>
				<Clock className='h-4 w-4' />
				<span className='flex-1 text-left'>Просроченные ЕПБ</span>
				{filterMode === 'overdue' && filterCodes.size > 0 && (
					<Badge variant='secondary' className='ml-auto bg-white/20 text-white'>
						{filterCodes.size}
					</Badge>
				)}
			</Button>

			<Button
				variant={filterMode === 'defective' ? 'default' : 'outline'}
				onClick={() => handleFilterClick('defective')}
				disabled={isLoading}
				className={cn(
					'min-w-30 justify-start gap-2',
					filterMode === 'defective' &&
						'bg-orange-600 hover:bg-orange-700 text-white',
				)}
			>
				<AlertOctagon className='h-4 w-4' />
				<span className='flex-1 text-left'>Дефектные</span>
				{filterMode === 'defective' && filterCodes.size > 0 && (
					<Badge variant='secondary' className='ml-auto bg-white/20 text-white'>
						{filterCodes.size}
					</Badge>
				)}
			</Button>

			{/* Поиск */}
			<div className='relative flex-1 min-w-75'>
				<Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
				<Input
					type='text'
					placeholder='Поиск по коду, наименованию, классу...'
					value={localSearch}
					onChange={handleSearchChange}
					className='pl-8 pr-8 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500'
				/>
				{localSearch && (
					<Button
						variant='ghost'
						size='icon'
						className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-gray-800'
						onClick={handleClearSearch}
					>
						<X className='h-3 w-3' />
					</Button>
				)}
			</div>

			{/* Индикатор загрузки */}
			{isLoading && (
				<div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
			)}

			{/* Кнопка сброса фильтра */}
			{(filterMode || localSearch) && (
				<Button
					variant='ghost'
					size='sm'
					onClick={handleClearFilter}
					className='text-gray-400 hover:text-white hover:bg-gray-800'
				>
					<X className='h-4 w-4 mr-1' />
					Сбросить все фильтры
				</Button>
			)}
		</div>
	)
}

EquipmentFilterBarComponent.displayName = 'EquipmentFilterBar'
export const EquipmentFilterBar = memo(EquipmentFilterBarComponent)
export default EquipmentFilterBar
