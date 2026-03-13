'use client'

import { useCallback, useState } from 'react'

export const useModelSelector = () => {
	const [currentModelPath, setCurrentModelPath] = useState(
		'/models/KS-17_optimized.glb',
	)
	const [currentModelName, setCurrentModelName] = useState(
		'KS-17_optimized.glb',
	)

	const handleModelChange = useCallback(
		(modelPath: string, modelName: string) => {
			setCurrentModelPath(modelPath)
			setCurrentModelName(modelName)
		},
		[],
	)

	return {
		currentModelPath,
		currentModelName,
		handleModelChange,
	}
}
