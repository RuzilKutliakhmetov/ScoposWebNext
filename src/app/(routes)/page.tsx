import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardSkeleton from './loading'

export const metadata: Metadata = {
	title: 'Главная | SCOPOS',
	description: 'Главная панель управления системой SCOPOS 3D',
}

// Опционально: предзагрузка данных для дашборда
async function getDashboardStats() {
	try {
		// Здесь можно предзагрузить статистику с сервера
		// const stats = await apiService.getDashboardStats()
		return { stats: null, error: null }
	} catch (err) {
		console.error('Error preloading dashboard stats:', err)
		return { stats: null, error: 'Failed to load dashboard stats' }
	}
}

export default async function DashboardPage() {
	const { stats, error } = await getDashboardStats()

	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContent initialStats={stats} initialError={error} />
		</Suspense>
	)
}
