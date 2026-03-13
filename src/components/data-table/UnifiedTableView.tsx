'use client'

import { emitCustomEvent } from '@/hooks/useCustomEvent'

import { useDataTable } from '@/context/DataTableContext'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { cn } from '@/lib/utils/utils'
import type { EquipmentItem } from '@/types/api'
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type Header,
	type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronUp, FileText } from 'lucide-react'
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { TablePagination } from './TablePagination'

const COLUMN_WIDTHS = {
	code: 110,
	name: 200,
	className: 130,
	inventoryNumber: 110,
} as const

interface UnifiedTableViewProps {
	equipmentList: EquipmentItem[]
	loading: boolean
	error: string | null
	onSelectEquipment: (modelCode: string) => void
	onSaveState?: (search: string, sort: any, pagination: any) => void
	savedState?: {
		search: string
		sort: any
		pagination: any
	}
}

const HeaderCell = memo(
	({ header, width }: { header: Header<any, unknown>; width: number }) => {
		const sorted = header.column.getIsSorted()

		return (
			<div
				className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none shrink-0 border-r border-gray-800 last:border-r-0 hover:text-white transition-colors'
				style={{ width: `${width}px` }}
				onClick={header.column.getToggleSortingHandler()}
			>
				<div className='flex items-center gap-1 truncate'>
					<span className='truncate'>
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
					{sorted && (
						<ChevronUp
							className={cn(
								'h-4 w-4 shrink-0 transition-transform',
								sorted === 'asc' && 'rotate-180',
							)}
						/>
					)}
				</div>
			</div>
		)
	},
)

HeaderCell.displayName = 'HeaderCell'

const TableRow = memo(
	({
		row,
		virtualRow,
		onClick,
		filterMode,
		filterCodes,
	}: {
		row: any
		virtualRow: any
		onClick: () => void
		filterMode: string | null
		filterCodes: Set<string>
	}) => {
		const cells = row.getVisibleCells()
		const item = row.original as EquipmentItem
		const isInFilter =
			filterMode && filterCodes.has(item.modelCode || item.code)

		const handleClick = () => {
			if (filterMode && filterCodes.size > 0 && !isInFilter) return
			onClick()
		}

		return (
			<div
				className={cn(
					'absolute w-full flex border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer',
					isInFilter && 'border-l-4',
				)}
				style={{
					height: `${virtualRow.size}px`,
					transform: `translateY(${virtualRow.start}px)`,
					borderLeftColor: filterMode === 'overdue' ? '#ef4444' : '#f97316',
				}}
				onClick={handleClick}
			>
				{/* Код */}
				<div
					className='px-3 py-3 flex items-center shrink-0 border-r border-gray-800/30'
					style={{ width: `${COLUMN_WIDTHS.code}px` }}
				>
					<div className='font-mono text-sm text-gray-300 truncate w-full'>
						{flexRender(cells[0].column.columnDef.cell, cells[0].getContext())}
					</div>
				</div>

				{/* Наименование */}
				<div
					className='px-3 py-3 flex items-center shrink-0 border-r border-gray-800/30'
					style={{ width: `${COLUMN_WIDTHS.name}px` }}
				>
					<div className='text-sm text-white truncate w-full'>
						{flexRender(cells[1].column.columnDef.cell, cells[1].getContext())}
					</div>
				</div>

				{/* Класс */}
				<div
					className='px-3 py-3 flex items-center shrink-0 border-r border-gray-800/30'
					style={{ width: `${COLUMN_WIDTHS.className}px` }}
				>
					<div className='text-sm text-gray-300 truncate w-full'>
						{flexRender(cells[2].column.columnDef.cell, cells[2].getContext())}
					</div>
				</div>

				{/* Инв. номер */}
				<div
					className='px-3 py-3 flex items-center shrink-0'
					style={{ width: `${COLUMN_WIDTHS.inventoryNumber}px` }}
				>
					<div className='font-mono text-xs text-gray-400 truncate w-full'>
						{flexRender(cells[3].column.columnDef.cell, cells[3].getContext())}
					</div>
				</div>
			</div>
		)
	},
)

TableRow.displayName = 'TableRow'

export const UnifiedTableView: React.FC<UnifiedTableViewProps> = memo(
	({
		equipmentList,
		loading,
		error,
		onSelectEquipment,
		onSaveState,
		savedState = {
			search: '',
			sort: null,
			pagination: { pageIndex: 0, pageSize: 20 },
		},
	}) => {
		const [sorting, setSorting] = useState<SortingState>(savedState.sort || [])
		const { state } = useDataTable()
		const tableContainerRef = useRef<HTMLDivElement>(null)
		const { filterMode, filterCodes } = useEquipmentFilter()

		const columns = useMemo(
			() => [
				{
					id: 'code',
					accessorKey: 'code',
					header: 'Код',
					cell: (info: any) => (
						<div className='truncate font-mono text-sm'>{info.getValue()}</div>
					),
					size: COLUMN_WIDTHS.code,
					enableSorting: true,
				},
				{
					id: 'name',
					accessorKey: 'name',
					header: 'Наименование',
					cell: (info: any) => (
						<div className='truncate text-sm'>{info.getValue()}</div>
					),
					size: COLUMN_WIDTHS.name,
					enableSorting: true,
				},
				{
					id: 'className',
					accessorKey: 'className',
					header: 'Класс',
					cell: (info: any) => (
						<div className='truncate text-sm'>{info.getValue()}</div>
					),
					size: COLUMN_WIDTHS.className,
					enableSorting: true,
				},
				{
					id: 'inventoryNumber',
					accessorKey: 'inventoryNumber',
					header: 'Инв. номер',
					cell: (info: any) => (
						<div className='truncate font-mono text-xs'>{info.getValue()}</div>
					),
					size: COLUMN_WIDTHS.inventoryNumber,
					enableSorting: true,
				},
			],
			[],
		)

		const filteredEquipmentList = useMemo(() => {
			if (!filterMode || filterCodes.size === 0) {
				return equipmentList
			}
			return equipmentList.filter(item =>
				filterCodes.has(item.modelCode || item.code),
			)
		}, [equipmentList, filterMode, filterCodes])

		const table = useReactTable({
			data: filteredEquipmentList,
			columns,
			state: {
				sorting,
				globalFilter: state.searchQuery,
			},
			onSortingChange: setSorting,
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			enableSorting: true,
			enableMultiSort: false,
			sortDescFirst: false,
			initialState: {
				pagination: savedState.pagination,
				sorting: savedState.sort || [],
			},
		})

		const { rows } = table.getRowModel()
		const { pageSize, pageIndex } = table.getState().pagination
		const pageCount = table.getPageCount()

		useEffect(() => {
			if (onSaveState) {
				onSaveState(state.searchQuery, sorting, { pageIndex, pageSize })
			}
		}, [state.searchQuery, sorting, pageIndex, pageSize, onSaveState])

		const rowVirtualizer = useVirtualizer({
			count: rows.length,
			getScrollElement: () => tableContainerRef.current,
			estimateSize: () => 48,
			overscan: 5,
		})

		const handleSelectEquipment = useCallback(
			(modelCode: string) => {
				emitCustomEvent('focus-on-object', {
					objectName: modelCode,
					instant: false,
				})
				emitCustomEvent('select-object', { objectName: modelCode })
				onSelectEquipment(modelCode)
			},
			[onSelectEquipment],
		)

		const handlePageSizeChange = useCallback(
			(size: number) => {
				table.setPageSize(size)
				table.setPageIndex(0)
			},
			[table],
		)

		const totalWidth = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0)

		if (loading) {
			return (
				<div className='flex justify-center items-center h-full'>
					<div className='animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent' />
				</div>
			)
		}

		if (error) {
			return (
				<div className='m-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg'>
					<p className='text-red-400 text-sm'>{error}</p>
				</div>
			)
		}

		return (
			<div className='h-full flex flex-col'>
				<div
					ref={tableContainerRef}
					className='flex-1 overflow-auto relative'
					style={{
						scrollbarWidth: 'thin',
						scrollbarColor: '#4b5563 #1f2937',
					}}
				>
					<div style={{ width: `${totalWidth}px`, minWidth: '100%' }}>
						{/* Заголовок */}
						<div className='sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-800'>
							<div className='flex'>
								{table.getHeaderGroups().map(headerGroup => (
									<React.Fragment key={headerGroup.id}>
										{headerGroup.headers.map(header => (
											<HeaderCell
												key={header.id}
												header={header}
												width={
													COLUMN_WIDTHS[
														header.column.id as keyof typeof COLUMN_WIDTHS
													]
												}
											/>
										))}
									</React.Fragment>
								))}
							</div>
						</div>

						{/* Тело */}
						{rows.length > 0 ? (
							<div
								className='relative'
								style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
							>
								{rowVirtualizer.getVirtualItems().map(virtualRow => {
									const row = rows[virtualRow.index]
									return (
										<TableRow
											key={row.id}
											row={row}
											virtualRow={virtualRow}
											filterMode={filterMode}
											filterCodes={filterCodes}
											onClick={() => {
												const modelCode =
													row.original.modelCode || row.original.code
												handleSelectEquipment(modelCode)
											}}
										/>
									)
								})}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-12'>
								<FileText className='h-12 w-12 text-gray-600 mb-4' />
								<p className='text-gray-400'>
									{filterMode
										? `Нет оборудования с типом "${filterMode === 'overdue' ? 'Просроченные' : 'Дефектные'}"`
										: 'Нет данных для отображения'}
								</p>
							</div>
						)}
					</div>
				</div>

				<TablePagination
					pageIndex={pageIndex}
					pageCount={pageCount}
					pageSize={pageSize}
					totalRows={filteredEquipmentList.length}
					onPageChange={table.setPageIndex}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>
		)
	},
)

UnifiedTableView.displayName = 'UnifiedTableView'
export default memo(UnifiedTableView)
