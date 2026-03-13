import { EquipmentPageContent } from '@/components/equipment/EquipmentPageContent'
import { apiService } from '@/lib/api/api-service'
import { Metadata } from 'next'
import { Suspense } from 'react'
import EquipmentLoading from './loading'

export const metadata: Metadata = {
	title: 'Оборудование | SCOPOS',
	description: 'Управление оборудованием и просмотр детальной информации',
}

// Предзагрузка данных на сервере (опционально)
async function getEquipmentList() {
	try {
		const data = await apiService.getAllEquipment()
		return { data, error: null }
	} catch (err) {
		console.error('Error preloading equipment:', err)
		return { data: [], error: 'Failed to load equipment' }
	}
}

export default async function EquipmentPage() {
	const { data: initialData, error: initialError } = await getEquipmentList()

	return (
		<Suspense fallback={<EquipmentLoading />}>
			<EquipmentPageContent
				initialData={initialData}
				initialError={initialError}
			/>
		</Suspense>
	)
}
