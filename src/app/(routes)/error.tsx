'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Dashboard page error:', error)
	}, [error])

	return (
		<div className='h-full flex items-center justify-center p-6'>
			<div className='text-center max-w-md'>
				<div className='bg-destructive/10 rounded-full p-3 w-fit mx-auto mb-4'>
					<AlertCircle className='h-8 w-8 text-destructive' />
				</div>

				<h2 className='text-xl font-semibold text-white mb-2'>
					Ошибка загрузки дашборда
				</h2>

				<p className='text-gray-400 mb-6'>
					{error.message || 'Не удалось загрузить данные для главной страницы'}
				</p>

				<div className='flex gap-3 justify-center'>
					<Button onClick={reset} variant='default'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Попробовать снова
					</Button>

					<Button
						onClick={() => (window.location.href = '/')}
						variant='outline'
					>
						Обновить страницу
					</Button>
				</div>
			</div>
		</div>
	)
}
