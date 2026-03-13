'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/utils'

import type { EquipmentDetails } from '@/types/api'
import { Building2, Calendar, Hash, Info, Tag, Wrench } from 'lucide-react'
import React, { memo } from 'react'

interface EquipmentDetailsViewProps {
	equipment: EquipmentDetails
}

const DetailItem: React.FC<{
	label: string
	value: string
	icon?: React.ReactNode
	monospace?: boolean
}> = memo(({ label, value, icon, monospace = false }) => (
	<div className='space-y-1'>
		<div className='flex items-center gap-1 text-xs text-gray-400'>
			{icon}
			<span>{label}:</span>
		</div>
		<p className={cn('text-sm text-white', monospace && 'font-mono')}>
			{value || '—'}
		</p>
	</div>
))

DetailItem.displayName = 'DetailItem'

const DetailsColumn: React.FC<{ equipment: EquipmentDetails }> = memo(
	({ equipment }) => (
		<div className='space-y-4'>
			<DetailItem
				label='Код оборудования'
				value={equipment.code}
				icon={<Hash className='h-3 w-3' />}
				monospace
			/>
			<DetailItem
				label='Класс оборудования'
				value={equipment.className}
				icon={<Tag className='h-3 w-3' />}
			/>
			{equipment.type && (
				<DetailItem
					label='Тип'
					value={equipment.type}
					icon={<Tag className='h-3 w-3' />}
				/>
			)}
			<DetailItem
				label='Инвентарный номер'
				value={equipment.inventoryNumber}
				icon={<Hash className='h-3 w-3' />}
				monospace
			/>
		</div>
	),
)

DetailsColumn.displayName = 'DetailsColumn'

const AdditionalDetailsColumn: React.FC<{ equipment: EquipmentDetails }> = memo(
	({ equipment }) => (
		<div className='space-y-4'>
			{equipment.parentName && (
				<DetailItem
					label='Родительский объект'
					value={equipment.parentName}
					icon={<Building2 className='h-3 w-3' />}
				/>
			)}
			{equipment.branchName && (
				<DetailItem
					label='Филиал'
					value={equipment.branchName}
					icon={<Building2 className='h-3 w-3' />}
				/>
			)}
			{equipment.prDepName && (
				<DetailItem
					label='Подразделение'
					value={equipment.prDepName}
					icon={<Building2 className='h-3 w-3' />}
				/>
			)}

			{(equipment.userStat || equipment.systemStat) && (
				<div className='grid grid-cols-2 gap-4'>
					{equipment.userStat && (
						<DetailItem
							label='Статус пользователя'
							value={equipment.userStat}
							icon={<Wrench className='h-3 w-3' />}
						/>
					)}
					{equipment.systemStat && (
						<DetailItem
							label='Системный статус'
							value={equipment.systemStat}
							icon={<Info className='h-3 w-3' />}
						/>
					)}
				</div>
			)}

			{equipment.comissioningDate && (
				<DetailItem
					label='Дата ввода в эксплуатацию'
					value={new Date(equipment.comissioningDate).toLocaleDateString(
						'ru-RU',
					)}
					icon={<Calendar className='h-3 w-3' />}
				/>
			)}

			{equipment.serialNumber && (
				<DetailItem
					label='Серийный номер'
					value={equipment.serialNumber}
					icon={<Hash className='h-3 w-3' />}
				/>
			)}
		</div>
	),
)

AdditionalDetailsColumn.displayName = 'AdditionalDetailsColumn'

export const EquipmentDetailsViewComponent: React.FC<
	EquipmentDetailsViewProps
> = ({ equipment }) => {
	return (
		<ScrollArea className='h-full'>
			<div className='p-6'>
				<Card className='bg-gray-900/50 border-gray-800'>
					<CardHeader>
						<CardTitle className='text-xl text-white'>
							{equipment.name}
						</CardTitle>
						<div className='flex gap-2 mt-2'>
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
					</CardHeader>

					<CardContent className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<DetailsColumn equipment={equipment} />
							<AdditionalDetailsColumn equipment={equipment} />
						</div>

						{(equipment.epbDate ||
							equipment.epbNextDate ||
							equipment.epbNextDatePlan) && (
							<>
								<Separator className='bg-gray-800' />
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									{equipment.epbDate && (
										<DetailItem
											label='Дата ЭПБ'
											value={new Date(equipment.epbDate).toLocaleDateString(
												'ru-RU',
											)}
											icon={<Calendar className='h-3 w-3' />}
										/>
									)}
									{equipment.epbNextDate && (
										<DetailItem
											label='Следующая ЭПБ'
											value={new Date(equipment.epbNextDate).toLocaleDateString(
												'ru-RU',
											)}
											icon={<Calendar className='h-3 w-3' />}
										/>
									)}
									{equipment.epbNextDatePlan && (
										<DetailItem
											label='Плановая ЭПБ'
											value={new Date(
												equipment.epbNextDatePlan,
											).toLocaleDateString('ru-RU')}
											icon={<Calendar className='h-3 w-3' />}
										/>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</ScrollArea>
	)
}

EquipmentDetailsViewComponent.displayName = 'EquipmentDetailsView'
export const EquipmentDetailsView = memo(EquipmentDetailsViewComponent)
export default EquipmentDetailsView
