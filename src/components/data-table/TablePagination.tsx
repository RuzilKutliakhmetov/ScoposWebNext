'use client'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react'
import React, { memo } from 'react'

export const PAGE_SIZES = [10, 20, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

interface TablePaginationProps {
	pageIndex: number
	pageCount: number
	pageSize: number
	totalRows: number
	onPageChange: (index: number) => void
	onPageSizeChange: (size: number) => void
}

export const TablePagination: React.FC<TablePaginationProps> = memo(
	({
		pageIndex,
		pageCount,
		pageSize,
		totalRows,
		onPageChange,
		onPageSizeChange,
	}) => {
		const start = pageIndex * pageSize + 1
		const end = Math.min((pageIndex + 1) * pageSize, totalRows)

		return (
			<div className='p-4 border-t border-gray-800 flex items-center justify-between'>
				<div className='text-sm text-gray-400'>
					{start}-{end} из {totalRows}
				</div>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='icon'
						onClick={() => onPageChange(0)}
						disabled={pageIndex === 0}
						className='h-8 w-8 bg-gray-800 border-gray-700 hover:bg-gray-700'
					>
						<ChevronsLeft className='h-4 w-4' />
					</Button>

					<Button
						variant='outline'
						size='icon'
						onClick={() => onPageChange(pageIndex - 1)}
						disabled={pageIndex === 0}
						className='h-8 w-8 bg-gray-800 border-gray-700 hover:bg-gray-700'
					>
						<ChevronLeft className='h-4 w-4' />
					</Button>

					<span className='text-sm text-gray-400 px-2'>
						{pageIndex + 1} / {pageCount}
					</span>

					<Button
						variant='outline'
						size='icon'
						onClick={() => onPageChange(pageIndex + 1)}
						disabled={pageIndex === pageCount - 1}
						className='h-8 w-8 bg-gray-800 border-gray-700 hover:bg-gray-700'
					>
						<ChevronRight className='h-4 w-4' />
					</Button>

					<Button
						variant='outline'
						size='icon'
						onClick={() => onPageChange(pageCount - 1)}
						disabled={pageIndex === pageCount - 1}
						className='h-8 w-8 bg-gray-800 border-gray-700 hover:bg-gray-700'
					>
						<ChevronsRight className='h-4 w-4' />
					</Button>

					<Select
						value={pageSize.toString()}
						onValueChange={value => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className='w-32.5 h-8 bg-gray-800 border-gray-700 text-gray-300'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className='bg-gray-900 border-gray-700'>
							{PAGE_SIZES.map(size => (
								<SelectItem key={size} value={size.toString()}>
									{size} на странице
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		)
	},
)

TablePagination.displayName = 'TablePagination'
export default TablePagination
