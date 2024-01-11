import { requestFormData, requestJson } from "@/utils/service"
import type * as Meal from "./types/meal"

/** 增 */
export function createDataApi(data: any) {
  return requestFormData({
    url: "Products",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: number[]) {
  return requestJson({
    url: `Products`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateDataApi(data: any) {
  return requestFormData({
    url: `Products`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Meal.ReadResData>({
    url: "Products",
    method: "get"
  })
}
