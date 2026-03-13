'use client'

import { TablePagination } from '@/components/data-table/TablePagination'
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
	type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronUp, FileText } from 'lucide-react'
import React, { memo, useCallback, useMemo, useRef, useState } from 'react'

const COLUMN_WIDTHS = {
	code: 120,
	name: 300,
	className: 180,
	inventoryNumber: 130,
	location: 250,
} as const

interface EquipmentTableContentProps {
	equipmentList: EquipmentItem[]
	loading: boolean
	error: string | null
	onSelectEquipment: (modelCode: string) => void
	selectedCode?: string
	searchQuery: string
}

const TableHeader = memo(({ header }: { header: any }) => {
	const sorted = header.column.getIsSorted()

	return (
		<div
			className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white shrink-0 border-r border-gray-800 last:border-r-0'
			style={{
				width: `${COLUMN_WIDTHS[header.column.id as keyof typeof COLUMN_WIDTHS]}px`,
			}}
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
})

TableHeader.displayName = 'TableHeader'

const TableRow = memo(
	({
		row,
		virtualRow,
		onClick,
		filterMode,
		filterCodes,
		selectedCode,
	}: {
		row: any
		virtualRow: any
		onClick: () => void
		filterMode: string | null
		filterCodes: Set<string>
		selectedCode?: string
	}) => {
		const cells = row.getVisibleCells()
		const item = row.original as EquipmentItem
		const isInFilter =
			filterMode && filterCodes.has(item.modelCode || item.code)
		const isSelected = selectedCode === (item.modelCode || item.code)

		const handleClick = () => {
			if (filterMode && filterCodes.size > 0 && !isInFilter) return
			onClick()
		}

		return (
			<div
				className={cn(
					'absolute w-full flex border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer',
					isInFilter && 'border-l-4',
					isSelected && 'bg-primary/20 hover:bg-primary/30',
				)}
				style={{
					height: `${virtualRow.size}px`,
					transform: `translateY(${virtualRow.start}px)`,
					borderLeftColor: filterMode === 'overdue' ? '#ef4444' : '#f97316',
				}}
				onClick={handleClick}
			>
				{cells.map((cell: any) => (
					<div
						key={cell.id}
						className='px-4 py-3 flex items-center shrink-0 border-r border-gray-800/30 last:border-r-0'
						style={{
							width: `${COLUMN_WIDTHS[cell.column.id as keyof typeof COLUMN_WIDTHS]}px`,
						}}
					>
						<div className='truncate w-full'>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</div>
					</div>
				))}
			</div>
		)
	},
)

TableRow.displayName = 'TableRow'

export const EquipmentTableContent: React.FC<EquipmentTableContentProps> = memo(
	({
		equipmentList,
		loading,
		error,
		onSelectEquipment,
		selectedCode,
		searchQuery,
	}) => {
		const [sorting, setSorting] = useState<SortingState>([])
		const tableContainerRef = useRef<HTMLDivElement>(null)
		const { filterMode, filterCodes } = useEquipmentFilter()

		const columns = useMemo(
			() => [
				{
					id: 'code',
					accessorKey: 'code',
					header: 'Код',
					cell: (info: any) => (
						<div className='truncate font-mono text-sm text-gray-300'>
							{info.getValue()}
						</div>
					),
					size: COLUMN_WIDTHS.code,
					enableSorting: true,
				},
				{
					id: 'name',
					accessorKey: 'name',
					header: 'Наименование',
					cell: (info: any) => (
						<div className='truncate text-white font-medium'>
							{info.getValue()}
						</div>
					),
					size: COLUMN_WIDTHS.name,
					enableSorting: true,
				},
				{
					id: 'className',
					accessorKey: 'className',
					header: 'Класс',
					cell: (info: any) => (
						<div className='truncate text-sm text-gray-400'>
							{info.getValue()}
						</div>
					),
					size: COLUMN_WIDTHS.className,
					enableSorting: true,
				},
				{
					id: 'inventoryNumber',
					accessorKey: 'inventoryNumber',
					header: 'Инв. номер',
					cell: (info: any) => (
						<div className='truncate font-mono text-xs text-gray-400'>
							{info.getValue()}
						</div>
					),
					size: COLUMN_WIDTHS.inventoryNumber,
					enableSorting: true,
				},
				{
					id: 'location',
					accessorKey: 'location',
					header: 'Расположение',
					cell: (info: any) => (
						<div className='truncate text-sm text-gray-400'>
							{info.getValue()}
						</div>
					),
					size: COLUMN_WIDTHS.location,
					enableSorting: true,
				},
			],
			[],
		)

		const table = useReactTable({
			data: equipmentList,
			columns,
			state: {
				sorting,
				globalFilter: searchQuery,
			},
			onSortingChange: setSorting,
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			enableSorting: true,
			enableMultiSort: false,
			globalFilterFn: (row, columnId, filterValue) => {
				const value = row.getValue(columnId) as string
				return value?.toLowerCase().includes(filterValue.toLowerCase())
			},
			initialState: {
				pagination: { pageSize: 20, pageIndex: 0 },
			},
		})

		const { rows } = table.getRowModel()
		const { pageSize, pageIndex } = table.getState().pagination
		const pageCount = table.getPageCount()
		const totalWidth = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0)

		const rowVirtualizer = useVirtualizer({
			count: rows.length,
			getScrollElement: () => tableContainerRef.current,
			estimateSize: () => 48,
			overscan: 5,
		})

		const handleRowClick = useCallback(
			(row: EquipmentItem) => {
				const modelCode = row.modelCode || row.code
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

		if (loading) {
			return (
				<div className='flex-1 flex items-center justify-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent' />
				</div>
			)
		}

		if (error) {
			return (
				<div className='flex-1 flex items-center justify-center p-4'>
					<div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4'>
						<p className='text-red-400 text-sm'>{error}</p>
					</div>
				</div>
			)
		}

		return (
			<div className='flex-1 flex flex-col overflow-hidden'>
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
											<TableHeader key={header.id} header={header} />
										))}
									</React.Fragment>
								))}
							</div>
						</div>

						{/* Строки */}
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
											selectedCode={selectedCode}
											onClick={() => handleRowClick(row.original)}
										/>
									)
								})}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-12'>
								<FileText className='h-12 w-12 text-gray-600 mb-4' />
								<p className='text-gray-400'>
									{searchQuery
										? 'Ничего не найдено по вашему запросу'
										: filterMode
											? `Нет оборудования с типом "${filterMode === 'overdue' ? 'Просроченные' : 'Дефектные'}"`
											: 'Нет данных для отображения'}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Пагинация */}
				<TablePagination
					pageIndex={pageIndex}
					pageCount={pageCount}
					pageSize={pageSize}
					totalRows={equipmentList.length}
					onPageChange={table.setPageIndex}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>
		)
	},
)

EquipmentTableContent.displayName = 'EquipmentTableContent'
export default memo(EquipmentTableContent)
