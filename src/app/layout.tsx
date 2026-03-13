import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
	title: 'SCOPOS 3D',
	description: '3D просмотрщик оборудования',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru' className='dark'>
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
