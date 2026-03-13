// src/app/page.tsx
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardSkeleton from './(routes)/loading'

export const metadata: Metadata = {
	title: 'Главная | SCOPOS',
	description: 'Главная панель управления системой SCOPOS 3D',
}

export default function RootPage() {
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContent />
		</Suspense>
	)
}
