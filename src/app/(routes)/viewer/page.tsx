import { Metadata } from 'next'
import { Suspense } from 'react'

import { ViewerClientWrapper } from './ViewerClientWrapper'
import ViewerLoading from './loading'

export const metadata: Metadata = {
	title: '3D Просмотрщик | SCOPOS',
	description: 'Просмотр 3D моделей оборудования',
}

export default function ViewerPage() {
	return (
		<Suspense fallback={<ViewerLoading />}>
			<ViewerClientWrapper />
		</Suspense>
	)
}
