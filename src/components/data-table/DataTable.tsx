'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { emitCustomEvent, useCustomEvent } from '@/hooks/useCustomEvent'
import React, { memo, useCallback, useEffect } from 'react'

import { useDataTable } from '@/context/DataTableContext'
import { useEquipmentFilter } from '@/context/EquipmentFilterContext'
import EquipmentDetailsView from './EquipmentDetailsView'
import { TableHeader } from './TableHeader'
import { UnifiedTableView } from './UnifiedTableView'

interface DataTableProps {
	isOpen: boolean
	onClose: () => void
	selectedObjectCode?: string
}

const DataTableComponent: React.FC<DataTableProps> = ({
	isOpen,
	onClose,
	selectedObjectCode,
}) => {
	const {
		state,
		fetchEquipmentList,
		selectEquipment,
		clearSelection,
		saveTableState,
	} = useDataTable()

	const { filterMode } = useEquipmentFilter()

	useEffect(() => {
		if (isOpen) {
			if (filterMode) {
				clearSelection()
			}
			fetchEquipmentList()
		}
	}, [filterMode, isOpen, fetchEquipmentList, clearSelection])

	useEffect(() => {
		if (isOpen && selectedObjectCode) {
			handleSelectEquipment(selectedObjectCode)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, selectedObjectCode])

	const handleOpenDetails = useCallback(
		(detail: { code: string }) => {
			if (isOpen) {
				handleSelectEquipment(detail.code)
			}
		},
		[isOpen],
	)

	const handleResetCamera = useCallback(() => {
		clearSelection()
	}, [clearSelection])

	useCustomEvent('open-equipment-details', handleOpenDetails)
	useCustomEvent('reset-camera', handleResetCamera)

	const handleSelectEquipment = async (modelCode: string) => {
		await selectEquipment(modelCode)
	}

	const handleClose = () => {
		emitCustomEvent('clear-selections')
		clearSelection()
		onClose()
	}

	const handleBackToList = () => {
		emitCustomEvent('clear-selections')
		clearSelection()
	}

	return (
		<Sheet open={isOpen} onOpenChange={open => !open && handleClose()}>
			<SheetContent
				side='right'
				className='w-full sm:max-w-xl p-0 bg-gray-950 border-l border-gray-800'
			>
				{/* Добавляем скрытый заголовок для доступности */}
				<VisuallyHidden>
					<SheetTitle>Таблица данных оборудования</SheetTitle>
				</VisuallyHidden>

				<div className='h-full flex flex-col'>
					<TableHeader
						selectedEquipment={state.selectedEquipment}
						onBack={handleBackToList}
						onClose={handleClose}
					/>

					<div className='flex-1 overflow-hidden'>
						{state.selectedEquipment ? (
							<EquipmentDetailsView equipment={state.selectedEquipment} />
						) : (
							<UnifiedTableView
								equipmentList={state.equipmentList}
								loading={state.loading}
								error={state.error}
								onSelectEquipment={handleSelectEquipment}
								onSaveState={saveTableState}
								savedState={state.tableState}
							/>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}

DataTableComponent.displayName = 'DataTable'
export const DataTable = memo(DataTableComponent)
export default DataTable
