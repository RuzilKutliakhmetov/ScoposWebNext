'use client'

import { DataTableProvider } from '@/context/DataTableContext'
import { EquipmentFilterProvider } from '@/context/EquipmentFilterContext'
import { apiService } from '@/lib/api/api-service'
import { logger } from '@/lib/utils/logger'
import type { EquipmentDetails, EquipmentItem } from '@/types/api'
import React, { useCallback, useEffect, useState } from 'react'
import { EquipmentDetailsPanel } from './EquipmentDetailsPanel'
import { EquipmentFilterBar } from './EquipmentFilterBar'
import { EquipmentTable } from './EquipmentTable'

interface EquipmentPageContentProps {
	initialData?: EquipmentItem[]
	initialError?: string | null
}

export const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({
	initialData = [],
	initialError = null,
}) => {
	const [equipmentList, setEquipmentList] =
		useState<EquipmentItem[]>(initialData)
	const [loading, setLoading] = useState(!initialData.length)
	const [error, setError] = useState<string | null>(initialError)
	const [selectedEquipment, setSelectedEquipment] =
		useState<EquipmentDetails | null>(null)
	const [detailsLoading, setDetailsLoading] = useState(false)
	const [showDetails, setShowDetails] = useState(false)

	// Загрузка списка оборудования (если нет начальных данных)
	const loadEquipmentList = useCallback(async () => {
		if (initialData.length > 0) return

		try {
			setLoading(true)
			setError(null)
			const data = await apiService.getAllEquipment()
			setEquipmentList(data)
		} catch (err) {
			logger.error('Error loading equipment:', err)
			setError('Не удалось загрузить список оборудования')
		} finally {
			setLoading(false)
		}
	}, [initialData.length])

	// Загрузка детальной информации
	const loadEquipmentDetails = useCallback(async (modelCode: string) => {
		try {
			setDetailsLoading(true)
			const details = await apiService.getEquipmentByModelCode(modelCode)
			setSelectedEquipment(details)
			setShowDetails(true)
		} catch (err) {
			logger.error('Error loading equipment details:', err)
		} finally {
			setDetailsLoading(false)
		}
	}, [])

	// Обработчик выбора оборудования
	const handleSelectEquipment = useCallback(
		(modelCode: string) => {
			loadEquipmentDetails(modelCode)
		},
		[loadEquipmentDetails],
	)

	// Закрытие детальной информации
	const handleCloseDetails = useCallback(() => {
		setShowDetails(false)
		setTimeout(() => {
			setSelectedEquipment(null)
		}, 300)
	}, [])

	useEffect(() => {
		loadEquipmentList()
	}, [loadEquipmentList])

	return (
		<DataTableProvider>
			<EquipmentFilterProvider onFilterChange={() => {}}>
				<div className='h-full bg-gray-950/80 backdrop-blur border border-gray-800 rounded-lg overflow-hidden flex flex-col'>
					{/* Панель фильтрации с поиском */}
					<EquipmentFilterBar />

					{/* Контейнер для таблицы и детальной информации */}
					<div className='flex-1 flex overflow-hidden relative'>
						{/* Таблица */}
						<div
							className='flex-1 overflow-hidden transition-all duration-300 ease-in-out'
							style={{ width: showDetails ? 'calc(100% - 600px)' : '100%' }}
						>
							<EquipmentTable
								equipmentList={equipmentList}
								loading={loading}
								error={error}
								onSelectEquipment={handleSelectEquipment}
								selectedCode={selectedEquipment?.code}
							/>
						</div>

						{/* Детальная информация */}
						<EquipmentDetailsPanel
							equipment={selectedEquipment}
							isOpen={showDetails}
							loading={detailsLoading}
							onClose={handleCloseDetails}
						/>
					</div>
				</div>
			</EquipmentFilterProvider>
		</DataTableProvider>
	)
}

EquipmentPageContent.displayName = 'EquipmentPageContent'
export default EquipmentPageContent
