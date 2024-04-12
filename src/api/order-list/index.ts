import { requestJson } from "@/utils/service"
import type * as Order from "./types/order"

/** 增 */
export function createDataApi(data: Order.createReqData) {
  return requestJson({
    url: `OrderInfos/BackgroundOrder?storeName=${data.storeName}&tableNumber=${data.tableNumber}`,
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: string[]) {
  return requestJson({
    url: `OrderInfos`,
    method: "delete",
    data: ids
  })
}

/** 確認付款 */
export function confirmPayApi(orderId: string) {
  return requestJson({
    url: `Payment/ConfirmPay?orderID=${orderId}`,
    method: "post"
  })
}

/** 取消 */
export function cancelDataApi(orderId: string) {
  return requestJson({
    url: `Payment/CancelOrder?orderId=${orderId}`,
    method: "post"
  })
}

/** 取得生日優惠的退款金額 */
export function getBirthBonusPrice(orderId: string, birthdayCount: number) {
  return requestJson({
    url: `OrderInfos/BirthdayBonusPrice/${orderId}?birthdayCount=${birthdayCount}`,
    method: "get"
  })
}
/** 生日優惠退款 */
export function birthRefund(orderId: string, count: number, bonus: number, remark: string) {
  return requestJson({
    url: `Payment/RefundOrder?orderId=${orderId}&birthdayCount=${count}&refundAmount=${bonus}&remark=${remark}`,
    method: "post"
  })
}

/** 後台開始備餐 */
export function preparingOrder(orderId: string) {
  return requestJson({
    url: `OrderInfos/PreparingOrder?orderId=${orderId}`,
    method: "post"
  })
}
/** 後台備餐完成 */
export function doneOrder(orderId: string) {
  return requestJson({
    url: `OrderInfos/DoneOrder?orderId=${orderId}`,
    method: "post"
  })
}

/** 改 */
export function updateDataApi(data: Order.UpdateReqData) {
  return requestJson({
    url: `OrderInfos/${data.orderId}`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<any>({
    url: "OrderInfos",
    method: "get"
  })
}

export function getBackstageDataApi() {
  return requestJson<any>({
    url: "OrderInfos/GetOrdersToBeMade",
    method: "get"
  })
}
