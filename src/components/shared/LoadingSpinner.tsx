'use client'

import { cn } from '@/lib/utils/utils'
import React from 'react'

interface LoadingSpinnerProps {
	progress: number
	message?: string
	className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	progress,
	message = 'Загрузка модели',
	className,
}) => {
	const bgColor = '#65adf1ff'

	return (
		<div
			className={cn(
				'fixed inset-0 flex items-center justify-center',
				className,
			)}
			style={{
				background: `linear-gradient(135deg, ${bgColor} 0%, #1e293b 100%)`,
			}}
		>
			<div className='animate-in fade-in duration-1000'>
				<div className='bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-2xl w-100 text-center'>
					<h3 className='text-white text-xl font-medium mb-2'>
						{message.replace('.glb', '')}
					</h3>
					<div className='text-white text-7xl font-light mb-4'>
						{Math.round(progress)}%
					</div>
					<div className='h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden'>
						<div
							className='h-full rounded-full transition-all duration-300 ease-out'
							style={{
								width: `${progress}%`,
								background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
							}}
						/>
					</div>
					<p className='text-white/40 text-xs mt-4'>
						{progress < 100 ? 'Идет загрузка...' : 'Загрузка завершена'}
					</p>
				</div>
			</div>
		</div>
	)
}

// Добавляем экспорт по умолчанию
export default LoadingSpinner
