import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
	try {
		const modelsDirectory = path.join(process.cwd(), 'public/models')
		const files = fs.readdirSync(modelsDirectory)
		const models = files.filter(
			file => file.endsWith('.glb') || file.endsWith('.gltf'),
		)

		return NextResponse.json({ models })
	} catch (error) {
		return NextResponse.json({ models: [] })
	}
}
