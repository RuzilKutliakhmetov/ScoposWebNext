'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function EquipmentError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Equipment page error:', error)
	}, [error])

	return (
		<div className='h-full flex items-center justify-center'>
			<div className='text-center max-w-md p-6'>
				<AlertCircle className='h-12 w-12 text-destructive mx-auto mb-4' />
				<h2 className='text-xl font-semibold text-white mb-2'>
					Ошибка загрузки
				</h2>
				<p className='text-gray-400 mb-4'>
					{error.message || 'Не удалось загрузить страницу оборудования'}
				</p>
				<Button onClick={reset} variant='outline'>
					Попробовать снова
				</Button>
			</div>
		</div>
	)
}
