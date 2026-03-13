import {
	CreateNotifyDto,
	EqNotify,
	EquipmentDetails,
	EquipmentItem,
	EquipmentNotifyShort,
	EquipmentWithNotifies,
	NotifyStats,
} from '@/types/api'
import axios, { type AxiosInstance } from 'axios'

class ApiService {
	private api: AxiosInstance
	private baseURL: string

	constructor() {
		this.baseURL = this.determineBaseURL()
		console.log('🔧 API Service initialized with baseURL:', this.baseURL)

		this.api = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			withCredentials: true,
			// Для самоподписанных сертификатов в разработке
			httpsAgent:
				process.env.NODE_ENV === 'development'
					? new (require('https').Agent)({
							rejectUnauthorized: false,
						})
					: undefined,
		})

		this.setupInterceptors()
	}

	private determineBaseURL(): string {
		// 1. Приоритет: переменная окружения
		console.log(process.env.NEXT_PUBLIC_API_URL)
		if (process.env.NEXT_PUBLIC_API_URL) {
			return process.env.NEXT_PUBLIC_API_URL
		}

		// 2. Для серверного рендеринга
		if (typeof window === 'undefined') {
			return 'https://localhost:7218'
		}

		// 3. Для клиента - определяем по текущему хосту
		const hostname = window.location.hostname
		const protocol = window.location.protocol

		// Если мы на сетевом адресе (192.168.x.x), используем HTTPS
		if (hostname.startsWith('192.168.')) {
			return `https://${hostname}:7218`
		}

		// Для localhost - HTTPS
		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			return 'https://localhost:7218'
		}

		// По умолчанию
		return 'https://localhost:7218'
	}

	private setupInterceptors() {
		this.api.interceptors.request.use(
			config => {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
					)
				}
				return config
			},
			error => {
				console.error('❌ Request Error:', error)
				return Promise.reject(error)
			},
		)

		this.api.interceptors.response.use(
			response => {
				if (process.env.NODE_ENV === 'development') {
					console.log(`✅ ${response.status} ${response.config.url}`)
				}
				return response
			},
			error => {
				// Специальная обработка для HTTPS ошибок
				if (
					error.code === 'ERR_CERT_AUTHORITY_INVALID' ||
					error.code === 'ERR_CERT_UNTRUSTED' ||
					error.message?.includes('certificate')
				) {
					console.error('❌ SSL Certificate Error:', {
						message: 'Самоподписанный сертификат не доверенный',
						url: this.baseURL,
						solution: 'В Chrome откройте https://localhost:7218 и примите риск',
					})

					return Promise.reject(
						new Error(
							`SSL сертификат не доверенный. Откройте ${this.baseURL} в браузере и примите риск.`,
						),
					)
				}

				if (error.code === 'ERR_NETWORK') {
					console.error('❌ Network Error - API server is not available:', {
						baseURL: this.baseURL,
						message: error.message,
					})

					// В режиме разработки возвращаем мок данные
					if (process.env.NODE_ENV === 'development') {
						console.warn('⚠️ Using mock data for development')
						// Возвращаем специальный объект, чтобы обработать в методах
						throw { useMock: true, error }
					}

					return Promise.reject(
						new Error(
							`API сервер недоступен по адресу ${this.baseURL}. ` +
								`Проверьте:\n` +
								`1. Запущен ли бэкенд сервер (https://localhost:7218)\n` +
								`2. Примите сертификат в браузере\n` +
								`3. Настройки CORS на бэкенде`,
						),
					)
				}

				if (error.response) {
					console.error('❌ API Error:', {
						status: error.response.status,
						statusText: error.response.statusText,
						url: error.config?.url,
						data: error.response.data,
					})

					if (error.response.status === 0) {
						console.error('CORS Error - проверьте настройки CORS на бэкенде')
					}
				} else if (error.request) {
					console.error('❌ No response received:', error.request)
				} else {
					console.error('❌ Request Setup Error:', error.message)
				}

				return Promise.reject(error)
			},
		)
	}

	private async requestWithRetry<T>(
		requestFn: () => Promise<T>,
		maxRetries = 2,
	): Promise<T> {
		for (let i = 0; i < maxRetries; i++) {
			try {
				return await requestFn()
			} catch (error: any) {
				// Если это ошибка с пометкой useMock, используем мок данные
				if (error?.useMock) {
					console.log('📦 Using mock data due to network error')
					break
				}

				console.log(`🔄 Retry attempt ${i + 1}/${maxRetries}`)
				if (i === maxRetries - 1) throw error
				await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
			}
		}

		// Возвращаем мок данные для разработки
		if (process.env.NODE_ENV === 'development') {
			return this.getMockData() as T
		}

		throw new Error('Max retries exceeded')
	}

	// Метод для получения мок данных в зависимости от типа запроса
	private getMockData(): any {
		return this.getMockEquipmentData()
	}

	// ---------------- EQUIPMENT ----------------

	async getAllEquipment(): Promise<EquipmentItem[]> {
		try {
			console.log(
				'📡 Fetching equipment from:',
				`${this.baseURL}/api/equipment`,
			)
			const response = await this.api.get<EquipmentItem[]>('/api/equipment')
			console.log('📦 Received equipment:', response.data.length, 'items')
			return response.data
		} catch (error) {
			console.error('Error in getAllEquipment:', error)

			// В режиме разработки возвращаем мок данные
			if (process.env.NODE_ENV === 'development') {
				console.warn('⚠️ Using mock data for development')
				return this.getMockEquipmentData()
			}
			throw error
		}
	}

	private getMockEquipmentData(): EquipmentItem[] {
		return [
			{
				code: 'EQ-001',
				modelCode: 'MODEL-001',
				name: 'Насос центробежный НЦ-100',
				className: 'Насосное оборудование',
				inventoryNumber: 'INV-001',
				manufacturer: 'ООО "Завод"',
				serialNumber: 'SN-001',
				location: 'Цех №1, помещение 101',
			},
			{
				code: 'EQ-002',
				modelCode: 'MODEL-002',
				name: 'Компрессор винтовой КВ-200',
				className: 'Компрессорное оборудование',
				inventoryNumber: 'INV-002',
				manufacturer: 'АО "Компрессор"',
				serialNumber: 'SN-002',
				location: 'Цех №2, помещение 205',
			},
			{
				code: 'EQ-003',
				modelCode: 'MODEL-003',
				name: 'Резервуар вертикальный РВС-1000',
				className: 'Емкостное оборудование',
				inventoryNumber: 'INV-003',
				manufacturer: 'АО "Нефтемаш"',
				serialNumber: 'SN-003',
				location: 'Площадка №3',
			},
			{
				code: 'EQ-004',
				modelCode: 'MODEL-004',
				name: 'Трубопровод магистральный ТМ-500',
				className: 'Трубопроводное оборудование',
				inventoryNumber: 'INV-004',
				manufacturer: 'ООО "Трубопроводстрой"',
				serialNumber: 'SN-004',
				location: 'Участок №5',
			},
		]
	}

	async getEquipmentByCode(code: string): Promise<EquipmentDetails> {
		try {
			const encoded = encodeURIComponent(code)
			const response = await this.api.get<EquipmentDetails>(
				`/api/equipment/${encoded}`,
			)
			return response.data
		} catch (error) {
			console.error('Error in getEquipmentByCode:', error)
			throw error
		}
	}

	async getEquipmentByModelCode(modelCode: string): Promise<EquipmentDetails> {
		try {
			const encoded = encodeURIComponent(modelCode)
			console.log(encoded)
			const response = await this.api.get<EquipmentDetails>(
				`/api/equipment/by-model/${encoded}`,
			)
			return response.data
		} catch (error) {
			console.error('Error in getEquipmentByModelCode:', error)
			throw error
		}
	}

	async getEquipmentWithoutModel(): Promise<EquipmentItem[]> {
		try {
			const response = await this.api.get<EquipmentItem[]>(
				'/api/equipment/without-model',
			)
			return response.data
		} catch (error) {
			console.error('Error in getEquipmentWithoutModel:', error)
			throw error
		}
	}

	async getOverdueEquipment(): Promise<string[]> {
		try {
			const response = await this.api.get<string[]>(
				'/api/equipment/overdue-simple',
			)
			return response.data
		} catch (error) {
			console.error('Error in getOverdueEquipment:', error)
			// Мок данные для разработки
			if (process.env.NODE_ENV === 'development') {
				return ['MODEL-001', 'MODEL-003']
			}
			throw error
		}
	}

	// ---------------- NOTIFY ----------------

	async getDefectiveEquipment(): Promise<string[]> {
		try {
			const response = await this.api.get<string[]>(
				'/api/notify/equipment/modelcodes',
			)
			return response.data
		} catch (error) {
			console.error('Error in getDefectiveEquipment:', error)
			// Мок данные для разработки
			if (process.env.NODE_ENV === 'development') {
				return ['MODEL-002', 'MODEL-004']
			}
			throw error
		}
	}

	async getEquipmentWithNotifiesShort(): Promise<EquipmentNotifyShort[]> {
		try {
			const response = await this.api.get<EquipmentNotifyShort[]>(
				'/api/notify/equipment/short',
			)
			return response.data
		} catch (error) {
			console.error('Error in getEquipmentWithNotifiesShort:', error)
			throw error
		}
	}

	async getEquipmentWithNotifies(
		modelCode: string,
	): Promise<EquipmentWithNotifies> {
		try {
			const encoded = encodeURIComponent(modelCode)
			const response = await this.api.get<EquipmentWithNotifies>(
				`/api/notify/equipment/model/${encoded}`,
			)
			return response.data
		} catch (error) {
			console.error('Error in getEquipmentWithNotifies:', error)
			throw error
		}
	}

	async getNotifiesByEquipment(eoCode: string): Promise<EqNotify[]> {
		try {
			const encoded = encodeURIComponent(eoCode)
			const response = await this.api.get<EqNotify[]>(
				`/api/notify/by-equipment/${encoded}`,
			)
			return response.data
		} catch (error) {
			console.error('Error in getNotifiesByEquipment:', error)
			throw error
		}
	}

	async getNotifyStats(): Promise<NotifyStats> {
		try {
			const response = await this.api.get<NotifyStats>('/api/notify/stats')
			return response.data
		} catch (error) {
			console.error('Error in getNotifyStats:', error)
			throw error
		}
	}

	async getFilteredNotifies(params: {
		eoCode?: string
		criticality?: string
		status?: string
		fromDate?: string
		toDate?: string
		qmType?: string
	}): Promise<EqNotify[]> {
		try {
			const response = await this.api.get<EqNotify[]>('/api/notify/filtered', {
				params,
			})
			return response.data
		} catch (error) {
			console.error('Error in getFilteredNotifies:', error)
			throw error
		}
	}

	async createNotify(data: CreateNotifyDto): Promise<EqNotify> {
		try {
			const response = await this.api.post<EqNotify>('/api/notify', data)
			return response.data
		} catch (error) {
			console.error('Error in createNotify:', error)
			throw error
		}
	}

	getBaseURL(): string {
		return this.baseURL
	}
}

// Создаем и экспортируем единственный экземпляр
export const apiService = new ApiService()

// Для отладки - выводим URL в консоль при инициализации
if (typeof window !== 'undefined') {
	console.log('🌐 API Service running with baseURL:', apiService.getBaseURL())
}
