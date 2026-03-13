'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDataTable } from '@/context/DataTableContext'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { cn } from '@/lib/utils/utils'

import type { EquipmentDetails } from '@/types/api'
import { ArrowLeft, Search, X } from 'lucide-react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

interface TableHeaderProps {
	selectedEquipment: EquipmentDetails | null
	onClose: () => void
	onBack: () => void
}

const TableHeaderComponent: React.FC<TableHeaderProps> = ({
	selectedEquipment,
	onClose,
	onBack,
}) => {
	const { filterMode } = useEquipmentFilter()
	const { state, setSearchQuery } = useDataTable()
	const [localSearch, setLocalSearch] = useState(state.searchQuery)
	const searchInputRef = useRef<HTMLInputElement>(null)
	const debounceTimerRef = useRef<number>(0)

	// Синхронизируем локальный стейт с глобальным при изменении извне
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
		if (searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [setSearchQuery])

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	return (
		<div className='flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95'>
			<div className='flex items-center gap-3 flex-1'>
				{!selectedEquipment ? (
					<>
						<h2 className='text-lg font-semibold text-white whitespace-nowrap'>
							Таблица данных
						</h2>
						<div className='relative flex-1 max-w-md'>
							<Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
							<Input
								ref={searchInputRef}
								type='text'
								placeholder='Поиск по таблице...'
								value={localSearch}
								onChange={handleSearchChange}
								className='pl-8 pr-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
							/>
							{localSearch && (
								<Button
									variant='ghost'
									size='icon'
									className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-gray-700'
									onClick={handleClearSearch}
								>
									<X className='h-3 w-3' />
								</Button>
							)}
						</div>
					</>
				) : (
					<Button
						variant='ghost'
						size='sm'
						onClick={onBack}
						className='text-blue-400 hover:text-blue-300 hover:bg-blue-950/50'
					>
						<ArrowLeft className='h-4 w-4 mr-1' />
						Вернуться к таблице
					</Button>
				)}
			</div>

			<div className='flex items-center gap-2 ml-4'>
				{selectedEquipment && !filterMode && (
					<span className='text-xs text-gray-400 mr-2 whitespace-nowrap'>
						Детальная информация
					</span>
				)}

				{filterMode && (
					<Badge
						variant='outline'
						className={cn(
							'px-3 py-1',
							filterMode === 'overdue'
								? 'bg-red-500/10 text-red-400 border-red-500/30'
								: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
						)}
					>
						{filterMode === 'overdue' ? 'Просроченные' : 'Дефектные'}
					</Badge>
				)}

				<Button
					variant='ghost'
					size='icon'
					onClick={onClose}
					className='text-gray-400 hover:text-white hover:bg-gray-800'
					title='Закрыть таблицу'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}

TableHeaderComponent.displayName = 'TableHeader'
export const TableHeader = memo(TableHeaderComponent)
export default TableHeader
