export interface OrderSelect {
  id: number
  selectName: string
  showOptionList: string[]
  activeOptionList: string[]
  min: number
  max: number
}

export interface OrderMeal {
  id: number | ""
  mealName: string
  price: number
  count: string
  selectList: OrderSelect[]
  note: string
}

export interface UpdateReqData {
  orderId: string
  storeName: string
  tableNumber: string
  mealList: OrderMeal[]
  total: number
  payMethod: string
}

export interface ReadData {
  orderId: string
  storeName: string
  tableNumber: string
  mealList: OrderMeal[]
  payMethod: string
  total: number
  orderTime: string
  payOrderId: string
  payStatus: number
  payTime: string
}
export type ReadResData = ReadData[]
