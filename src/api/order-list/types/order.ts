import { Option } from "@/api/select-list/types/select"

export interface OrderSelect {
  id: number
  selectName: string
  showOptionList: Option[]
  activeOptionList: Option[]
  min: number
  max: number
}

export interface OrderMeal {
  id: number | ""
  mealName: string | ""
  price: number
  originPrice: number
  count: string | number
  selectList: OrderSelect[]
  mainMeal: boolean
  note: string
}

export interface createReqData {
  storeName: string
  tableNumber: string
  birthdayBonus: number
  deliveryType: number
  birthdayAmount: number
  discountAmount: number
  payMethod: string
  total: number
  mealList: OrderMeal[]
}

export interface UpdateReqData {
  orderId: string
  storeName: string
  tableNumber: string
  deliveryType: number
  birthdayBonus: number
  birthdayAmount: number
  discountAmount: number
  payMethod: string
  total: number
  mealList: OrderMeal[]
}

export interface ReadData {
  orderId: string
  storeName: string
  tableNumber: string
  deliveryType: number
  birthdayBonus: number
  birthdayAmount: number
  discountAmount: number
  payMethod: string
  originTotal: number
  total: number
  mealList: OrderMeal[]
  orderStatus: number
  orderTime: string
  payOrderId: string
  payStatus: number
  payTime: string
}
export type ReadResData = ReadData[]
