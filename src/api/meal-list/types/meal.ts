// interface option {
//   optionName: string
//   optionPrice: number
// }

interface Select {
  selectName: string
  showOptionList: string[]
  max: number
  min: number
}

export interface CreateMealRequestData {
  id: number
  // CategoryList
  categorys?: string[]
  mealName: string
  image?: string
  file: any
  origin?: string
  selectList?: Select[]
  mealTextList?: string[]
  price: number
  count?: string
  enable?: number
}

export interface UpdateMealRequestData {
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  selectList?: Select[]
  price: number
}

export interface GetMealRequestData {
  /** 当前页码 */
  // currentPage: number
  /** 查询条数 */
  // size: number

  /** 查询参数：分類名稱 */
  mealName?: string
}

export type GetMealResponseData = CreateMealRequestData[]

// test
export interface GetMealData {
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  selectList?: Select[]
  price: number
}

// export type GetMealResponseData = ApiResponseData<{
//   list: CreateMealRequestData[]
//   total: number
// }>
