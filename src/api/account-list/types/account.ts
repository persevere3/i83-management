import { ReadResData as StoreReadResData } from "@/api/store-list/types/store"

export interface CreateReqData {
  account: string
  passWord: string
  enable: number
  permissions: number
  storeId: number | null
}

export interface UpdateReqData {
  id: number
  passWord?: string
  enable: number
  permissions: number
  storeId: number | null
}

export interface ReadData {
  id: number
  account: string
  passWord: string
  enable: number
  permissions: number
  loginDate: string
  changeDate: string
  store: StoreReadResData
}

export type ReadResData = ReadData[]
