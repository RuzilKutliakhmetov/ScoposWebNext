'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import { cn } from '@/lib/utils/utils'

import {
	AlertOctagon,
	AlignVerticalSpaceAround,
	Clock,
	Image,
	Move,
	Table,
} from 'lucide-react'
import React, { memo, useEffect } from 'react'

interface ToolbarProps {
	onResetCamera: () => void
	onPipelineToggle: () => void
	onBackgroundToggle: () => void
	onOpenTable: () => void
	isPipelineMode: boolean
	showBackground: boolean
	isTableOpen?: boolean
}

interface ToolbarButtonProps {
	onClick: () => void
	title: string
	icon: React.ReactNode
	active?: boolean
	disabled?: boolean
	loading?: boolean
	badgeCount?: number
	isFilterButton?: boolean
	filterMode?: string | null
}

const ToolbarButton = memo<ToolbarButtonProps>(
	({
		onClick,
		title,
		icon,
		active = false,
		disabled = false,
		loading = false,
		badgeCount = 0,
		isFilterButton = false,
		filterMode,
	}) => {
		const getVariant = () => {
			if (disabled || loading) return 'ghost'
			if (active) {
				if (isFilterButton && filterMode) {
					return filterMode === 'overdue' ? 'destructive' : 'default'
				}
				return 'default'
			}
			return 'ghost'
		}

		const getActiveClass = () => {
			if (!active) return ''
			if (isFilterButton && filterMode) {
				return filterMode === 'overdue'
					? 'bg-red-600 hover:bg-red-700 text-white'
					: 'bg-orange-600 hover:bg-orange-700 text-white'
			}
			return 'bg-primary text-primary-foreground'
		}

		return (
			<TooltipProvider>
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>
						<Button
							variant={getVariant()}
							size='icon'
							onClick={onClick}
							disabled={disabled || loading}
							className={cn(
								'relative',
								getActiveClass(),
								disabled && 'opacity-50 cursor-not-allowed',
							)}
						>
							{loading ? (
								<div className='h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent' />
							) : (
								<>
									{icon}
									{badgeCount > 0 && (
										<Badge
											variant='destructive'
											className={cn(
												'absolute -top-2 -right-2 h-5 min-w-5 px-1',
												filterMode === 'overdue'
													? 'bg-red-500'
													: 'bg-orange-500',
											)}
										>
											{badgeCount > 99 ? '99+' : badgeCount}
										</Badge>
									)}
								</>
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent
						side='right'
						className='bg-gray-900 text-white border-gray-800'
					>
						<p className='text-xs'>{title}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	},
)

ToolbarButton.displayName = 'ToolbarButton'

const ToolbarComponent: React.FC<ToolbarProps> = ({
	onResetCamera,
	onPipelineToggle,
	onBackgroundToggle,
	onOpenTable,
	isPipelineMode,
	showBackground,
	isTableOpen = false,
}) => {
	const { filterMode, filterCodes, isLoading, setFilterMode } =
		useEquipmentFilter()

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 'r':
						e.preventDefault()
						onResetCamera()
						break
					case 'p':
						e.preventDefault()
						onPipelineToggle()
						break
					case 'b':
						e.preventDefault()
						if (!isPipelineMode) onBackgroundToggle()
						break
					case 't':
						e.preventDefault()
						if (!isTableOpen) onOpenTable()
						break
					case 'o':
						e.preventDefault()
						setFilterMode('overdue')
						break
					case 'd':
						e.preventDefault()
						setFilterMode('defective')
						break
				}
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [
		onResetCamera,
		onPipelineToggle,
		onBackgroundToggle,
		onOpenTable,
		isPipelineMode,
		isTableOpen,
		setFilterMode,
	])

	return (
		<>
			{/* Main toolbar */}
			<div className='absolute top-6 left-6 z-50'>
				<div className='flex flex-col gap-1 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2'>
					<ToolbarButton
						onClick={onResetCamera}
						title='Сбросить камеру (Ctrl+R)'
						icon={<Move className='h-5 w-5' />}
					/>

					<div className='h-px w-full bg-gray-700' />

					<ToolbarButton
						onClick={onPipelineToggle}
						title={
							isPipelineMode
								? 'Все объекты (Ctrl+P)'
								: 'Только трубопроводы (Ctrl+P)'
						}
						icon={<AlignVerticalSpaceAround className='h-5 w-5' />}
						active={isPipelineMode}
					/>

					<ToolbarButton
						onClick={onBackgroundToggle}
						title={
							showBackground
								? 'Выключить фон (Ctrl+B)'
								: 'Включить фон (Ctrl+B)'
						}
						icon={<Image className='h-5 w-5' />}
						active={showBackground}
						disabled={isPipelineMode}
					/>

					<div className='h-px w-full bg-gray-700' />

					{/* Кнопки для фильтрации оборудования */}
					<ToolbarButton
						onClick={() => setFilterMode('overdue')}
						title={
							filterMode === 'overdue'
								? 'Сбросить просроченные (Ctrl+O)'
								: 'Показать просроченные (Ctrl+O)'
						}
						icon={<Clock className='h-5 w-5' />}
						active={filterMode === 'overdue'}
						loading={isLoading && filterMode === 'overdue'}
						badgeCount={filterMode === 'overdue' ? filterCodes.size : 0}
						isFilterButton={true}
						filterMode={filterMode}
					/>

					<ToolbarButton
						onClick={() => setFilterMode('defective')}
						title={
							filterMode === 'defective'
								? 'Сбросить дефектные (Ctrl+D)'
								: 'Показать дефектные (Ctrl+D)'
						}
						icon={<AlertOctagon className='h-5 w-5' />}
						active={filterMode === 'defective'}
						loading={isLoading && filterMode === 'defective'}
						badgeCount={filterMode === 'defective' ? filterCodes.size : 0}
						isFilterButton={true}
						filterMode={filterMode}
					/>
				</div>
			</div>

			{/* Table button - скрываем при открытой таблице */}
			{!isTableOpen && (
				<div className='absolute top-6 right-6 z-50'>
					<ToolbarButton
						onClick={onOpenTable}
						title='Открыть таблицу данных (Ctrl+T)'
						icon={<Table className='h-5 w-5' />}
					/>
				</div>
			)}
		</>
	)
}

ToolbarComponent.displayName = 'Toolbar'

export const Toolbar = memo(ToolbarComponent)
export default Toolbar
