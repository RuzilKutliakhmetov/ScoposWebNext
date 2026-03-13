'use client'

import { Canvas } from '@react-three/fiber'
import React, {
	lazy,
	memo,
	Suspense,
	useCallback,
	useMemo,
	useState,
} from 'react'

import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

import { DataTableProvider } from '@/context/DataTableContext'
import {
	EquipmentFilterMode,
	EquipmentFilterProvider,
} from '@/context/EquipmentFilterContext'
import { SelectionProvider } from '@/context/SelectionContext'
import { emitCustomEvent, useCustomEvent } from '@/hooks/useCustomEvent'
import { useModelLoader } from '@/hooks/useModelLoader'
import { useViewerConfig } from '@/hooks/useViewerConfig'
import { VIEWER_CONFIG } from '@/lib/config/viewerConfig'
import { logger } from '@/lib/utils/logger'
import { handleFilterChange } from '@/lib/utils/scene-utils'
import CustomOrbitControls from '../three/CustomOrbitControls'
import EquipmentFilterManager from '../three/EquipmentFilterManager'
import FocusController from '../three/FocusController'
import LayerManager from '../three/LayerManager'
import Lighting from '../three/Lighting'
import RenderOptimization from '../three/RenderOptimization'
import SelectionManager from '../three/SelectionManager'

// Ленивая загрузка тяжелых компонентов
const Toolbar = lazy(() => import('@/components/toolbar/Toolbar'))
const DataTable = lazy(() => import('@/components/data-table/DataTable'))

const ToolbarMemo = memo(Toolbar)
const DataTableMemo = memo(DataTable)

interface ViewerPageContentProps {
	currentModelPath?: string
	currentModelName?: string
	onModelChange?: (modelPath: string, modelName: string) => void
}

// Мемоизированный Canvas
const MemoizedCanvas = memo(({ children }: { children: React.ReactNode }) => {
	const config = useViewerConfig()

	const cameraConfig = useMemo(
		() => ({
			position: config.camera.position as [number, number, number],
			fov: config.camera.fov,
			near: config.camera.near,
			far: config.camera.far,
		}),
		[config.camera],
	)

	return (
		<Canvas
			camera={cameraConfig}
			onCreated={({ camera, scene }) => {
				Object.values(config.layers).forEach(layer => {
					camera.layers.enable(layer)
				})
				camera.lookAt(...config.camera.target)
				scene.add(camera)
				logger.info('🎥 Камера инициализирована')
				emitCustomEvent('scene-ready', { scene })
			}}
			gl={{
				antialias: config.rendering.antialias,
				outputColorSpace: config.rendering.outputColorSpace,
				powerPreference: 'high-performance',
			}}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
			}}
		>
			{children}
		</Canvas>
	)
})

MemoizedCanvas.displayName = 'MemoizedCanvas'

export const ViewerPageContent: React.FC<ViewerPageContentProps> = ({
	currentModelPath = VIEWER_CONFIG.model.path,
	currentModelName = VIEWER_CONFIG.model.name,
	onModelChange,
}) => {
	const { model, loading, progress, error } = useModelLoader({
		modelPath: currentModelPath,
		modelName: currentModelName,
	})

	const [showTable, setShowTable] = useState(false)
	const [isPipelineMode, setIsPipelineMode] = useState(false)
	const [showBackground, setShowBackground] = useState(true)
	const [selectedEquipmentCode, setSelectedEquipmentCode] = useState<string>()

	const config = useViewerConfig()

	const handleFilterChangeWrapper = useCallback((mode: EquipmentFilterMode) => {
		handleFilterChange(mode, setSelectedEquipmentCode)
	}, [])

	const handlePipelineToggle = useCallback(() => {
		const newMode = !isPipelineMode
		setIsPipelineMode(newMode)
		if (newMode) {
			window.dispatchEvent(new Event('clear-selections'))
			setSelectedEquipmentCode(undefined)
		}
	}, [isPipelineMode])

	const handleBackgroundToggle = useCallback(() => {
		if (isPipelineMode) return
		setShowBackground(!showBackground)
	}, [isPipelineMode, showBackground])

	const handleResetCamera = useCallback(() => {
		setSelectedEquipmentCode(undefined)
		window.dispatchEvent(new CustomEvent('reset-camera'))
		window.dispatchEvent(new Event('clear-selections'))
	}, [])

	const handleOpenTable = useCallback(() => {
		setSelectedEquipmentCode(undefined)
		setShowTable(true)
	}, [])

	const handleCloseTable = useCallback(() => {
		setShowTable(false)
		setSelectedEquipmentCode(undefined)
	}, [])

	useCustomEvent<{ code: string }>(
		'open-equipment-details',
		useCallback(detail => {
			setSelectedEquipmentCode(detail.code)
			setShowTable(true)
		}, []),
	)

	useCustomEvent(
		'reset-camera',
		useCallback(() => {
			setSelectedEquipmentCode(undefined)
		}, []),
	)

	if (loading) {
		return <LoadingSpinner progress={progress} message={currentModelName} />
	}

	if (error) {
		return (
			<div className='w-full h-full bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-4xl mb-4'>⚠️</div>
					<h2 className='text-white text-xl mb-2'>{error}</h2>
					<button
						onClick={() => window.location.reload()}
						className='mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
					>
						Обновить страницу
					</button>
				</div>
			</div>
		)
	}

	return (
		<SelectionProvider>
			<DataTableProvider>
				<EquipmentFilterProvider onFilterChange={handleFilterChangeWrapper}>
					<div
						className='w-full h-full overflow-hidden relative'
						style={{ backgroundColor: config.ui.backgroundColor }}
					>
						{/* Toolbar */}
						<Suspense fallback={null}>
							<ToolbarMemo
								onResetCamera={handleResetCamera}
								onPipelineToggle={handlePipelineToggle}
								onBackgroundToggle={handleBackgroundToggle}
								onOpenTable={handleOpenTable}
								isPipelineMode={isPipelineMode}
								showBackground={showBackground}
								isTableOpen={showTable}
							/>
						</Suspense>

						{/* DataTable */}
						<Suspense fallback={null}>
							<DataTableMemo
								isOpen={showTable}
								onClose={handleCloseTable}
								selectedObjectCode={selectedEquipmentCode}
							/>
						</Suspense>

						{/* Canvas */}
						<ErrorBoundary>
							<MemoizedCanvas>
								<Lighting />
								<RenderOptimization />
								<LayerManager
									isPipelineMode={isPipelineMode}
									showBackground={showBackground}
								/>
								{model && <primitive object={model} />}
								<SelectionManager />
								<EquipmentFilterManager />
								<CustomOrbitControls />
								<FocusController />
							</MemoizedCanvas>
						</ErrorBoundary>
					</div>
				</EquipmentFilterProvider>
			</DataTableProvider>
		</SelectionProvider>
	)
}

ViewerPageContent.displayName = 'ViewerPageContent'
export default memo(ViewerPageContent)
