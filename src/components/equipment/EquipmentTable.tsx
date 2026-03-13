'use client'

import { useDataTable } from '@/context/DataTableContext'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import type { EquipmentItem } from '@/types/api'
import React, { memo, useMemo } from 'react'
import { EquipmentTableContent } from './EquipmentTableContent'

interface EquipmentTableProps {
	equipmentList: EquipmentItem[]
	loading: boolean
	error: string | null
	onSelectEquipment: (modelCode: string) => void
	selectedCode?: string
}

const EquipmentTableComponent: React.FC<EquipmentTableProps> = ({
	equipmentList,
	loading,
	error,
	onSelectEquipment,
	selectedCode,
}) => {
	const { state } = useDataTable()
	const { filterMode, filterCodes } = useEquipmentFilter()

	// Фильтрация списка по активному фильтру
	const filteredList = useMemo(() => {
		if (!filterMode || filterCodes.size === 0) {
			return equipmentList
		}
		return equipmentList.filter(item =>
			filterCodes.has(item.modelCode || item.code),
		)
	}, [equipmentList, filterMode, filterCodes])

	return (
		<EquipmentTableContent
			equipmentList={filteredList}
			loading={loading}
			error={error}
			onSelectEquipment={onSelectEquipment}
			selectedCode={selectedCode}
			searchQuery={state.searchQuery}
		/>
	)
}

EquipmentTableComponent.displayName = 'EquipmentTable'
export const EquipmentTable = memo(EquipmentTableComponent)
export default EquipmentTable
