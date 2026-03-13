'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/utils'
import { Database, Eye, FileText, Home, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModelSelector } from './ModelSelector'

interface HeaderProps {
	currentModel?: string
	onModelSelect?: (modelPath: string, modelName: string) => void
}

const navItems = [
	{ href: '/', label: 'Главная', icon: Home },
	{ href: '/viewer', label: '3D Просмотрщик', icon: Eye },
	{ href: '/equipment', label: 'Оборудование', icon: Database },
	{ href: '/reports', label: 'Отчеты', icon: FileText },
	{ href: '/settings', label: 'Настройки', icon: Settings },
]

export function Header({ currentModel, onModelSelect }: HeaderProps) {
	const pathname = usePathname()

	return (
		<header className='border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-backdrop-filter:bg-gray-950/60'>
			<div className='flex h-16 items-center px-4'>
				{/* Левая часть */}
				<div className='flex items-center gap-6'>
					<Link href='/' className='font-semibold text-xl text-white'>
						SCOPOS 3D
					</Link>

					{/* Десктопная навигация */}
					<nav className='hidden md:flex items-center gap-1'>
						{navItems.map(item => {
							const Icon = item.icon
							const isActive = pathname === item.href

							return (
								<Button
									key={item.href}
									variant={isActive ? 'secondary' : 'ghost'}
									size='sm'
									asChild
									className={cn(
										'gap-2',
										isActive &&
											'bg-primary/20 text-primary hover:bg-primary/30',
									)}
								>
									<Link href={item.href}>
										<Icon className='h-4 w-4' />
										{item.label}
									</Link>
								</Button>
							)
						})}
					</nav>
				</div>

				{/* Правая часть */}
				<div className='flex items-center gap-4 ml-auto'>
					{pathname === '/viewer' && currentModel && onModelSelect && (
						<>
							<ModelSelector
								currentModel={currentModel}
								onModelSelect={onModelSelect}
							/>
							<div className='h-6 w-px bg-gray-800' />
						</>
					)}

					{/* Пользовательское меню */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
								<Avatar className='h-8 w-8'>
									<AvatarFallback>U</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56'>
							<DropdownMenuLabel>user@example.com</DropdownMenuLabel>
							<DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
								Администратор
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href='/settings' className='cursor-pointer'>
									<Settings className='mr-2 h-4 w-4' />
									Настройки
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className='text-red-500 focus:text-red-500'>
								<LogOut className='mr-2 h-4 w-4' />
								Выйти
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
