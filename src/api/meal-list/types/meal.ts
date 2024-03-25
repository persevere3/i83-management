import * as Select from "@/api/select-list/types/select"
import * as Category from "@/api/category-list/types/category"

export interface CreateReqData {
  id: number
  categorys?: number[]
  mealName: string
  image?: string
  file: any
  origin?: string
  mealTextList?: string[]
  selectList?: Select.MealSelectReadData[]
  price: number | undefined
  count?: string
  mainMeal: boolean | undefined
  enable?: number
}

export interface UpdateEnableReqData {
  productIds: number[]
  storeId: number
  changeType: number
}

export interface ReadData {
  id: number
  category: Omit<Category.ReadData, "products">[]
  mealName: string
  image: string
  origin: string
  mealTextList: string[]
  selectList: Select.MealSelectReadData[]
  price: number
  count: string
  mainMeal: boolean | undefined
  enable: number | undefined
}

export type ReadResData = ReadData[]
