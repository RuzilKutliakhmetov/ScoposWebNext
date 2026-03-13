export const logger = {
	info: (...args: any[]) => {
		if (process.env.DEV) console.log(...args)
	},

	warn: (...args: any[]) => {
		if (process.env.DEV) console.warn(...args)
	},

	error: (...args: any[]) => {
		console.error(...args) // Ошибки всегда логируем
	},

	debug: (...args: any[]) => {
		if (process.env.DEV && process.env.VITE_DEBUG === 'true') {
			console.debug(...args)
		}
	},
}
