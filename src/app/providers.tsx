'use client'

import { DataTableProvider } from '@/context/DataTableContext'
import { EquipmentFilterProvider } from '@/context/EquipmentFilterContext'
import { SelectionProvider } from '@/context/SelectionContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SelectionProvider>
				<DataTableProvider>
					<EquipmentFilterProvider onFilterChange={() => {}}>
						{children}
					</EquipmentFilterProvider>
				</DataTableProvider>
			</SelectionProvider>
		</QueryClientProvider>
	)
}
