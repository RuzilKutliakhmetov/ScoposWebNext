'use client'

import { useModelSelector } from '@/hooks/useModelSelector'
import dynamic from 'next/dynamic'

// Импортируем loading компонент
import ViewerLoading from './loading'

const ViewerPageContent = dynamic(
	() => import('@/components/viewer/ViewerPageContent'),
	{
		ssr: false,
		loading: () => <ViewerLoading />, // Используем правильный компонент
	},
)

export function ViewerClientWrapper() {
	const { currentModelPath, currentModelName, handleModelChange } =
		useModelSelector()

	return (
		<ViewerPageContent
			currentModelPath={currentModelPath}
			currentModelName={currentModelName}
			onModelChange={handleModelChange}
		/>
	)
}
