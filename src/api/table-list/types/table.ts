export interface CreateReqData {
  id: number
  storeName: string
  number: string
  orderToken?: string
  birthdayBonus: number
  enable: number
}

export interface UpdateReqData {
  id: number
  storeName: string
  number: string
  orderToken?: string
  enable: number
}

export interface ReadData {
  id: number
  storeName: string
  number: string
  orderToken?: string
  enable: number
}

export type ReadResData = ReadData[]
