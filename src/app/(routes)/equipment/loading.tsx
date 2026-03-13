'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function EquipmentLoading() {
	return (
		<div className='h-full bg-gray-950/80 backdrop-blur border border-gray-800 rounded-lg overflow-hidden flex flex-col'>
			<div className='p-4 border-b border-gray-800'>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-32 bg-gray-800' />
					<Skeleton className='h-10 w-28 bg-gray-800' />
					<Skeleton className='h-10 flex-1 bg-gray-800' />
				</div>
			</div>
			<div className='flex-1 p-4'>
				<div className='space-y-2'>
					{Array.from({ length: 10 }).map((_, i) => (
						<Skeleton key={i} className='h-12 w-full bg-gray-800/50' />
					))}
				</div>
			</div>
		</div>
	)
}
