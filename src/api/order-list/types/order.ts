// interface option {
//   optionName: string
//   optionPrice: number
// }

// interface requestMeal {
//   mealName: string
//   quantity: number
//   price: number
//   OptionList?: string[]
//   note: string
// }

interface responseMeal {
  mealName: string
  quantity: number
  price: number
  activeOptionList?: string[]
  note: string
}

// export interface CreateOrderRequestData {
//   mealList: Meal[]
// }

export interface GetOrderRequestData {
  /** 当前页码 */
  // currentPage: number
  /** 查询条数 */
  // size: number

  /** 查询参数：訂單編號 */
  id?: string
}

export interface GetOrderData {
  id: string
  mealList: responseMeal[]
  totalPrice: number
  createTime: string
}

export type GetOrderResponseData = ApiResponseData<{
  list: GetOrderData[]
  total: number
}>
