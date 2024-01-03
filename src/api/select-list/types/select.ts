// interface option {
//   optionName: string
//   optionPrice: number
// }

export interface CreateReqData {
  id: number
  title: string
  optionList: string
  max: number
  min: number
}

export interface UpdateReqData {
  id: number
  title: string
  optionList: string
  max: number
  min: number
}

export interface ReadData {
  id: number
  title: string
  optionList: string[]
  max: number
  min: number
}

export type ReadResData = ReadData[]
