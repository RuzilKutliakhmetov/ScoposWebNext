'use client'

import { Header } from '@/components/layout/Header'
import { useModelSelector } from '@/hooks/useModelSelector'

export default function RoutesLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { currentModelName, currentModelPath, handleModelChange } =
		useModelSelector()

	return (
		<div className='h-screen flex flex-col overflow-hidden'>
			<Header
				currentModel={currentModelName}
				onModelSelect={handleModelChange}
			/>
			<main className='flex-1 overflow-hidden'>
				{/* Передаем пропсы в дочерние компоненты через клонирование или контекст */}
				{children}
			</main>
		</div>
	)
}
