'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
	return (
		<div className='p-6 space-y-6'>
			<div className='space-y-2'>
				<Skeleton className='h-8 w-48 bg-gray-800' />
				<Skeleton className='h-4 w-64 bg-gray-800' />
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className='bg-gray-900/50 border border-gray-800 rounded-lg p-4'
					>
						<Skeleton className='h-4 w-24 bg-gray-800 mb-2' />
						<Skeleton className='h-8 w-16 bg-gray-800' />
					</div>
				))}
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				{Array.from({ length: 2 }).map((_, i) => (
					<div
						key={i}
						className='bg-gray-900/50 border border-gray-800 rounded-lg p-4'
					>
						<Skeleton className='h-5 w-32 bg-gray-800 mb-4' />
						<Skeleton className='h-48 w-full bg-gray-800' />
					</div>
				))}
			</div>
		</div>
	)
}
