// ---------------- EQUIPMENT ----------------

export interface EquipmentItem {
	code: string
	modelCode: string | null
	name: string
	type?: string
	className: string
	parentCode?: string
	parentName?: string
	inventoryNumber: string
	manufacturer: string
	serialNumber: string | null
	productYear?: string
	productMonth?: string
	comissioningDate?: string | null
	branchName?: string
	prDepName?: string
	location: string
	userStat?: string
	systemStat?: string
}

export interface EquipmentDetails extends EquipmentItem {
	type: string
	parentCode: string
	parentName: string
	productYear: string
	productMonth: string
	comissioningDate: string | null
	branchName: string
	prDepName: string
	userStat: string
	systemStat: string
	epbDate: string | null
	epbNextDatePlan: string | null
	epbNextDate: string | null
}

export interface EquipmentSimple {
	modelCode: string
}

export type EquipmentModelCode = string

// ---------------- NOTIFY ----------------

export interface EqNotify {
	qmCode: string
	feCode: string
	eoCode: string

	qmType?: string
	qmGrpName?: string
	qmCodName?: string

	organization?: string

	feName?: string

	criticality?: string
	eliminationStatus?: string
	eliminationDate?: string | null

	repairStatus?: string
	orderInfo?: string

	createdDate?: string | null
}

// ---------------- EQUIPMENT + NOTIFY ----------------

export interface EquipmentWithNotifies {
	modelCode: string
	equipmentCode: string
	equipmentName?: string
	branchName?: string
	location?: string

	notifyCount: number

	notifies: EqNotify[]
}

export interface EquipmentNotifyShort {
	modelCode: string
	equipmentCode: string
	equipmentName?: string
	className?: string
	manufacturer?: string
	location?: string

	notifyCount: number
	criticalCount: number
	lastNotifyDate?: string | null
}

// ---------------- CREATE DTO ----------------

export interface CreateNotifyDto {
	qmCode: string
	feCode: string
	eoCode: string

	qmType?: string
	qmGrpCode?: string
	qmGrpName?: string
	qmCodCode?: string
	qmCodName?: string

	organization?: string

	feGrpCode?: string
	feGrpName?: string
	feCodCode?: string
	feCodName?: string
	feName?: string

	criticality?: string
	eliminationStatus?: string
	eliminationDate?: string | null

	repairStatus?: string
	orderInfo?: string
}

// ---------------- STATS ----------------

export interface NotifyCriticalityStat {
	criticality: string
	count: number
	percentage: number
}

export interface NotifyStatusStat {
	status: string
	count: number
}

export interface TopEquipmentNotify {
	equipmentCode: string
	equipmentName?: string
	modelCode?: string
	notifyCount: number
}

export interface NotifyStats {
	totalNotifies: number
	equipmentWithNotifiesCount: number

	byCriticality: NotifyCriticalityStat[]
	byStatus: NotifyStatusStat[]

	topEquipment: TopEquipmentNotify[]

	generatedAt: string
}
