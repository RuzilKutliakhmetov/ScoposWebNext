'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/utils'
import { Factory } from 'lucide-react'
import React, { memo, useEffect, useState } from 'react'

interface ModelSelectorProps {
	currentModel: string
	onModelSelect: (modelPath: string, modelName: string) => void
}

const ModelSelectorComponent: React.FC<ModelSelectorProps> = ({
	currentModel,
	onModelSelect,
}) => {
	const [models, setModels] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [open, setOpen] = useState(false)

	// Получаем список моделей при монтировании
	useEffect(() => {
		const loadModels = async () => {
			try {
				// В Next.js используем fetch для получения списка файлов
				// или можно использовать статический список, если он известен
				const response = await fetch('/api/models')
				if (response.ok) {
					const data = await response.json()
					setModels(data.models)
				} else {
					// Fallback: если API нет, используем статический список
					// или пробуем другой подход
					console.warn('Не удалось загрузить список моделей через API')
					setModels(['KS-17_optimized.glb']) // Заглушка
				}
			} catch (error) {
				console.error('Ошибка при загрузке списка моделей:', error)
				setModels(['KS-17_optimized.glb']) // Заглушка при ошибке
			} finally {
				setLoading(false)
			}
		}

		loadModels()
	}, [])

	const handleModelSelect = (modelName: string) => {
		onModelSelect(`/models/${modelName}`, modelName)
		setOpen(false)
	}

	const getCurrentModelName = () => {
		const parts = currentModel.split('/')
		return parts[parts.length - 1] || 'Выберите модель'
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-62.5 justify-between bg-gray-900/80 backdrop-blur border-gray-700/50',
						'hover:bg-gray-800/80 hover:border-gray-600/50',
						'text-white font-normal',
					)}
				>
					<div className='flex items-center gap-2 truncate'>
						<Factory className='h-4 w-4 text-gray-400 shrink-0' />
						<span className='truncate'>
							{loading ? 'Загрузка...' : getCurrentModelName()}
						</span>
					</div>
					<svg
						className={cn(
							'h-4 w-4 text-gray-400 transition-transform duration-200',
							open && 'rotate-180',
						)}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='start'
				className='w-62.5 max-h-60 overflow-y-auto bg-gray-900/95 backdrop-blur border-gray-700/50 text-white'
				style={{
					scrollbarWidth: 'thin',
					scrollbarColor: '#4b5563 #1f2937',
				}}
			>
				{models.length > 0 ? (
					models.map(model => {
						const isSelected = currentModel.includes(model)
						return (
							<DropdownMenuItem
								key={model}
								onClick={() => handleModelSelect(model)}
								disabled={isSelected}
								className={cn(
									'cursor-pointer gap-2',
									isSelected &&
										'bg-primary/20 text-primary hover:bg-primary/30',
								)}
							>
								<Factory
									className={cn(
										'h-4 w-4',
										isSelected ? 'text-primary' : 'text-gray-400',
									)}
								/>
								<span className='flex-1 truncate'>{model}</span>
							</DropdownMenuItem>
						)
					})
				) : (
					<div className='px-2 py-4 text-center text-sm text-gray-400'>
						{loading ? 'Загрузка...' : 'Нет доступных моделей'}
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

ModelSelectorComponent.displayName = 'ModelSelector'

export const ModelSelector = memo(ModelSelectorComponent)
