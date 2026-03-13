'use client'

import { Button } from '@/components/ui/button'
import { logger } from '@/lib/utils/logger'
import React from 'react'

interface Props {
	children: React.ReactNode
	fallback?: React.ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		logger.error('3D Viewer Error:', error)
		logger.error('Error Info:', errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className='absolute inset-0 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm z-50'>
						<div className='bg-red-950/50 border border-red-800 rounded-lg p-6 max-w-md'>
							<h3 className='text-lg font-semibold text-red-300 mb-2'>
								Ошибка рендеринга 3D
							</h3>
							<p className='text-red-400 text-sm'>
								{this.state.error?.message ||
									'Произошла ошибка при отображении сцены'}
							</p>
							<Button
								onClick={() => this.setState({ hasError: false })}
								variant='destructive'
								className='mt-4'
							>
								Попробовать снова
							</Button>
						</div>
					</div>
				)
			)
		}

		return this.props.children
	}
}
