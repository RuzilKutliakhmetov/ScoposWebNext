'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/utils'

import type { EquipmentDetails } from '@/types/api'
import {
	Building2,
	Calendar,
	Hash,
	Info,
	MapPin,
	Tag,
	Wrench,
	X,
} from 'lucide-react'
import React, { memo, useEffect, useState } from 'react'

interface EquipmentDetailsPanelProps {
	equipment: EquipmentDetails | null
	isOpen: boolean
	loading: boolean
	onClose: () => void
}

const DetailCard: React.FC<{
	icon: React.ReactNode
	label: string
	value: string
	monospace?: boolean
}> = memo(({ icon, label, value, monospace = false }) => (
	<Card className='bg-gray-900/40 border-gray-800 hover:bg-gray-900/60 transition-colors'>
		<CardContent className='p-3'>
			<div className='flex items-center gap-2 mb-1'>
				<div className='text-primary'>{icon}</div>
				<span className='text-xs text-gray-400'>{label}</span>
			</div>
			<p className={cn('text-sm text-white pl-6', monospace && 'font-mono')}>
				{value || '—'}
			</p>
		</CardContent>
	</Card>
))

DetailCard.displayName = 'DetailCard'

const EquipmentDetailsPanelComponent: React.FC<EquipmentDetailsPanelProps> = ({
	equipment,
	isOpen,
	loading,
	onClose,
}) => {
	const [shouldRender, setShouldRender] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true)
		} else {
			const timer = setTimeout(() => setShouldRender(false), 300)
			return () => clearTimeout(timer)
		}
	}, [isOpen])

	if (!shouldRender) return null

	return (
		<div
			className={cn(
				'h-full border-l border-gray-800 bg-gray-950/98 backdrop-blur flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
				isOpen ? 'w-150 opacity-100' : 'w-0 opacity-0',
			)}
		>
			{/* Заголовок */}
			<div className='flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50'>
				<h2 className='text-lg font-semibold text-white'>
					Детальная информация
				</h2>
				<Button
					variant='ghost'
					size='icon'
					onClick={onClose}
					className='text-gray-400 hover:text-white hover:bg-gray-800'
				>
					<X className='h-5 w-5' />
				</Button>
			</div>

			{/* Контент */}
			<ScrollArea className='flex-1'>
				<div className='p-4'>
					{loading ? (
						<div className='space-y-4'>
							<Skeleton className='h-8 w-3/4 bg-gray-800' />
							<Skeleton className='h-4 w-1/2 bg-gray-800' />
							<div className='grid grid-cols-2 gap-4'>
								<Skeleton className='h-20 bg-gray-800' />
								<Skeleton className='h-20 bg-gray-800' />
								<Skeleton className='h-20 bg-gray-800' />
								<Skeleton className='h-20 bg-gray-800' />
							</div>
						</div>
					) : equipment ? (
						<div className='space-y-6'>
							{/* Заголовок с основным названием */}
							<Card className='bg-gray-900/60 border-gray-800'>
								<CardHeader className='pb-2'>
									<CardTitle className='text-xl text-white'>
										{equipment.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='flex gap-2 flex-wrap'>
										<Badge
											variant='outline'
											className='bg-primary/10 text-primary border-primary/20'
										>
											Код: {equipment.code}
										</Badge>
										{equipment.className && (
											<Badge
												variant='outline'
												className='bg-gray-800 text-gray-300 border-gray-700'
											>
												{equipment.className}
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Основные характеристики */}
							<div>
								<h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
									<Info className='h-4 w-4 text-primary' />
									Основные характеристики
								</h3>
								<div className='grid grid-cols-2 gap-3'>
									<DetailCard
										icon={<Hash className='h-4 w-4' />}
										label='Инвентарный номер'
										value={equipment.inventoryNumber}
										monospace
									/>
									{equipment.type && (
										<DetailCard
											icon={<Tag className='h-4 w-4' />}
											label='Тип'
											value={equipment.type}
										/>
									)}
									{equipment.manufacturer && (
										<DetailCard
											icon={<Building2 className='h-4 w-4' />}
											label='Производитель'
											value={equipment.manufacturer}
										/>
									)}
									{equipment.serialNumber && (
										<DetailCard
											icon={<Hash className='h-4 w-4' />}
											label='Серийный номер'
											value={equipment.serialNumber}
											monospace
										/>
									)}
								</div>
							</div>

							<Separator className='bg-gray-800' />

							{/* Расположение */}
							{(equipment.location ||
								equipment.branchName ||
								equipment.prDepName) && (
								<div>
									<h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
										<MapPin className='h-4 w-4 text-primary' />
										Расположение
									</h3>
									<div className='grid grid-cols-2 gap-3'>
										{equipment.location && (
											<DetailCard
												icon={<MapPin className='h-4 w-4' />}
												label='Позиция'
												value={equipment.location}
											/>
										)}
										{equipment.branchName && (
											<DetailCard
												icon={<Building2 className='h-4 w-4' />}
												label='Филиал'
												value={equipment.branchName}
											/>
										)}
										{equipment.prDepName && (
											<DetailCard
												icon={<Building2 className='h-4 w-4' />}
												label='Подразделение'
												value={equipment.prDepName}
											/>
										)}
									</div>
								</div>
							)}

							<Separator className='bg-gray-800' />

							{/* Даты */}
							{(equipment.productYear ||
								equipment.comissioningDate ||
								equipment.epbDate) && (
								<div>
									<h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-primary' />
										Даты и сроки
									</h3>
									<div className='grid grid-cols-2 gap-3'>
										{equipment.productYear && (
											<DetailCard
												icon={<Calendar className='h-4 w-4' />}
												label='Год выпуска'
												value={equipment.productYear}
											/>
										)}
										{equipment.comissioningDate && (
											<DetailCard
												icon={<Calendar className='h-4 w-4' />}
												label='Ввод в эксплуатацию'
												value={new Date(
													equipment.comissioningDate,
												).toLocaleDateString('ru-RU')}
											/>
										)}
										{equipment.epbDate && (
											<DetailCard
												icon={<Calendar className='h-4 w-4' />}
												label='Дата ЭПБ'
												value={new Date(equipment.epbDate).toLocaleDateString(
													'ru-RU',
												)}
											/>
										)}
										{equipment.epbNextDate && (
											<DetailCard
												icon={<Calendar className='h-4 w-4' />}
												label='Следующая ЭПБ'
												value={new Date(
													equipment.epbNextDate,
												).toLocaleDateString('ru-RU')}
											/>
										)}
										{equipment.epbNextDatePlan && (
											<DetailCard
												icon={<Calendar className='h-4 w-4' />}
												label='Плановая ЭПБ'
												value={new Date(
													equipment.epbNextDatePlan,
												).toLocaleDateString('ru-RU')}
											/>
										)}
									</div>
								</div>
							)}

							<Separator className='bg-gray-800' />

							{/* Статусы */}
							{(equipment.userStat || equipment.systemStat) && (
								<div>
									<h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
										<Wrench className='h-4 w-4 text-primary' />
										Статусы
									</h3>
									<div className='grid grid-cols-2 gap-3'>
										{equipment.userStat && (
											<DetailCard
												icon={<Info className='h-4 w-4' />}
												label='Статус пользователя'
												value={equipment.userStat}
											/>
										)}
										{equipment.systemStat && (
											<DetailCard
												icon={<Info className='h-4 w-4' />}
												label='Системный статус'
												value={equipment.systemStat}
											/>
										)}
									</div>
								</div>
							)}

							{/* Родительский объект */}
							{equipment.parentName && (
								<div>
									<h3 className='text-sm font-semibold text-white mb-3'>
										Родительский объект
									</h3>
									<Card className='bg-gray-900/60 border-gray-800'>
										<CardContent className='p-3'>
											<p className='text-white font-medium'>
												{equipment.parentName}
											</p>
											{equipment.parentCode && (
												<p className='text-xs text-gray-400 font-mono mt-1'>
													{equipment.parentCode}
												</p>
											)}
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					) : (
						<div className='text-center py-12'>
							<Info className='h-12 w-12 text-gray-600 mx-auto mb-4' />
							<p className='text-gray-400'>
								Выберите оборудование для просмотра детальной информации
							</p>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}

EquipmentDetailsPanelComponent.displayName = 'EquipmentDetailsPanel'
export const EquipmentDetailsPanel = memo(EquipmentDetailsPanelComponent)
export default EquipmentDetailsPanel
