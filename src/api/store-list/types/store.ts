export interface CreateReqData {
  id: number
  storeName: string
}

export interface UpdateReqData {
  id: number
  storeName: string
}

export interface ReadData {
  id: number
  storeName: string
}

export type ReadResData = ReadData[]
