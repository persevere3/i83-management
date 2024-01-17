import { requestJson } from "@/utils/service"
import type * as Order from "./types/order"

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
    url: `OrderInfos/ComfirmPay?OrderId=${orderId}`,
    method: "post"
  })
}

/** 取消 */
export function cancelDataApi(orderId: string) {
  return requestJson({
    url: `OrderInfos/CancelOrder?OrderId=${orderId}`,
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
  return requestJson<Order.ReadResData>({
    url: "OrderInfos",
    method: "get"
  })
}
