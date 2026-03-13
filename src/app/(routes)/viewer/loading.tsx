'use client'

import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ViewerLoading() {
	return <LoadingSpinner progress={0} message='Загрузка 3D просмотрщика...' />
}
