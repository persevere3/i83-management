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
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  selectList?: Select[]
  price: number
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

export interface GetMealData {
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  selectList?: Select[]
  price: number
}

export type GetMealResponseData = ApiResponseData<{
  list: GetMealData[]
  total: number
}>
