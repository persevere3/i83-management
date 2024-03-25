export interface Option {
  title: string
  price: number | undefined
  codeName: string | undefined
}

export interface CreateReqData {
  id: number
  title: string
  optionList: Option[]
  max: number
  min: number
}

export interface UpdateReqData {
  id: number
  title: string
  optionList: Option[]
  max: number
  min: number
}

export interface MealSelectReadData {
  id: number
  selectName: string
  showOptionList: any
  max: number
  min: number
}

export interface ReadData {
  id: number
  title: string
  optionList: Option[]
  max: number
  min: number
}

export type ReadResData = ReadData[]
