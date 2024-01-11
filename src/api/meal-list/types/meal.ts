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
  selectList?: Select.MealReadData[]
  price: number | undefined
  count?: string
  enable?: number
}

// UpdateReqData ?

export interface ReadData {
  id: number
  category: Omit<Category.ReadData, "products">[]
  mealName: string
  image: string
  origin: string
  mealTextList: string[]
  selectList: Select.MealReadData[]
  price: number
  count: string
  enable: number
}

export type ReadResData = ReadData[]
