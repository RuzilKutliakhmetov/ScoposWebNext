'use client'

import DashboardSkeleton from '@/app/(routes)/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/utils/logger'
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	TrendingUp,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface DashboardStats {
	totalEquipment: number
	overdueCount: number
	defectiveCount: number
	activeNotifies: number
}

interface DashboardContentProps {
	initialStats?: DashboardStats | null
	initialError?: string | null
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
	initialStats = null,
	initialError = null,
}) => {
	const [stats, setStats] = useState<DashboardStats | null>(initialStats)
	const [loading, setLoading] = useState(!initialStats)
	const [error, setError] = useState<string | null>(initialError)

	// Загрузка данных, если他们没有 в пропсах
	useEffect(() => {
		if (!initialStats) {
			loadDashboardData()
		}
	}, [initialStats])

	const loadDashboardData = async () => {
		try {
			setLoading(true)
			setError(null)

			// Здесь будет запрос к API
			// const data = await apiService.getDashboardStats()

			// Временные данные для примера
			const mockData: DashboardStats = {
				totalEquipment: 156,
				overdueCount: 12,
				defectiveCount: 8,
				activeNotifies: 23,
			}

			setStats(mockData)
		} catch (err) {
			logger.error('Error loading dashboard data:', err)
			setError('Не удалось загрузить данные дашборда')
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <DashboardSkeleton />
	}

	if (error) {
		return (
			<div className='p-6'>
				<div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4'>
					<p className='text-destructive'>{error}</p>
				</div>
			</div>
		)
	}

	const statCards = [
		{
			title: 'Всего оборудования',
			value: stats?.totalEquipment || 0,
			icon: Activity,
			color: 'text-blue-500',
			bgColor: 'bg-blue-500/10',
		},
		{
			title: 'Просроченные ЕПБ',
			value: stats?.overdueCount || 0,
			icon: Clock,
			color: 'text-red-500',
			bgColor: 'bg-red-500/10',
		},
		{
			title: 'Дефектные',
			value: stats?.defectiveCount || 0,
			icon: AlertTriangle,
			color: 'text-orange-500',
			bgColor: 'bg-orange-500/10',
		},
		{
			title: 'Активные уведомления',
			value: stats?.activeNotifies || 0,
			icon: FileText,
			color: 'text-green-500',
			bgColor: 'bg-green-500/10',
		},
	]

	return (
		<div className='p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-2xl font-bold text-white'>Главная панель</h1>
				<p className='text-gray-400 text-sm mt-1'>
					Общая статистика и мониторинг системы
				</p>
			</div>

			{/* Статистика */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{statCards.map((stat, index) => {
					const Icon = stat.icon
					return (
						<Card key={index} className='bg-gray-900/50 border-gray-800'>
							<CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
								<CardTitle className='text-sm font-medium text-gray-400'>
									{stat.title}
								</CardTitle>
								<div className={`p-2 rounded-full ${stat.bgColor}`}>
									<Icon className={`h-4 w-4 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-white'>
									{stat.value}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* Графики и таблицы */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				{/* График активности */}
				<Card className='bg-gray-900/50 border-gray-800'>
					<CardHeader>
						<CardTitle className='text-white'>
							Активность оборудования
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-64 flex items-center justify-center text-gray-500'>
							{/* Здесь будет график */}
							<div className='text-center'>
								<TrendingUp className='h-12 w-12 mx-auto mb-2 text-gray-600' />
								<p>График активности</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Статус оборудования */}
				<Card className='bg-gray-900/50 border-gray-800'>
					<CardHeader>
						<CardTitle className='text-white'>Статус оборудования</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span className='text-gray-300'>Исправно</span>
								</div>
								<span className='text-white font-medium'>136</span>
							</div>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Clock className='h-4 w-4 text-red-500' />
									<span className='text-gray-300'>Просрочено ЕПБ</span>
								</div>
								<span className='text-white font-medium'>12</span>
							</div>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<AlertTriangle className='h-4 w-4 text-orange-500' />
									<span className='text-gray-300'>Дефектное</span>
								</div>
								<span className='text-white font-medium'>8</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Последние уведомления */}
			<Card className='bg-gray-900/50 border-gray-800'>
				<CardHeader>
					<CardTitle className='text-white'>Последние уведомления</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{[1, 2, 3].map((_, i) => (
							<div
								key={i}
								className='p-3 bg-gray-800/50 rounded-lg border border-gray-700/50'
							>
								<div className='flex items-center gap-3'>
									<div className='w-2 h-2 rounded-full bg-yellow-500'></div>
									<p className='text-sm text-gray-300'>
										Обнаружена неисправность в оборудовании #{i + 1}
									</p>
									<span className='text-xs text-gray-500 ml-auto'>
										{i + 1} час назад
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

DashboardContent.displayName = 'DashboardContent'
