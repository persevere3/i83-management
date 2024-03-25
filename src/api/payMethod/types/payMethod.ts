export interface CreateReqData {
  id: number
  channel: number
  payId: string
  payKey: string
  enabled: boolean
}

export interface UpdateReqData {
  id: number
  channel: number
  payId: string
  payKey: string
  enabled: boolean
}

export interface ReadData {
  id: number
  channel: number
  payId: string
  payKey: string
  enabled: boolean
}
export type ReadResData = ReadData[]
