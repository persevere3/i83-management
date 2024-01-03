import { requestJson } from "@/utils/service"
import type * as Category from "./types/category"

/** 增 */
export function createDataApi(data: Category.CreateReqData) {
  console.log(data)
  return requestJson({
    url: "Categories",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: number[]) {
  return requestJson({
    url: `Categories`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateDataApi(data: Category.UpdateReqData) {
  return requestJson({
    url: "Categories",
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Category.ReadResData>({
    url: "Categories",
    method: "get"
  })
}
