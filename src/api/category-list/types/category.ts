export interface CreateReqData {
  id: number
  name: string
  text: string
  products: number[]
}

export interface UpdateReqData {
  id: number
  name: string
  text: string
  products: number[]
}

export interface Product {
  id: number
  mealName: string
  image: string
  origin: string
  mealTextList: string
  selectList: string
  price: number
  count: string
  enable: number
}
export interface ReadData {
  id: number
  name: string
  text: string
  products: Product[]
}
export type ReadResData = ReadData[]
