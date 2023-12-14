import { request } from "@/utils/service"
import type * as Order from "./types/order"

/** 增 */
export function createOrderDataApi(data: Order.CreateOrderRequestData) {
  return request({
    url: "table",
    method: "post",
    data
  })
}

/** 删 */
export function deleteOrderDataApi(id: string) {
  return request({
    url: `table/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateOrderDataApi(data: Order.UpdateOrderRequestData) {
  return request({
    url: "table",
    method: "put",
    data
  })
}

/** 查 */
export function getOrderDataApi(params: Order.GetOrderRequestData) {
  // Order.GetOrderResponseData ???
  return request<Order.GetOrderResponseData>({
    url: "table",
    method: "get",
    params
  })
}
