import { requestJson } from "@/utils/service"
import type * as Store from "./types/store"

/** 增 */
export function createDataApi(data: Store.CreateReqData) {
  return requestJson({
    url: "Stores",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(id: number) {
  return requestJson({
    url: `Stores/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateDataApi(data: Store.UpdateReqData) {
  return requestJson({
    url: `Stores/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Store.ReadResData>({
    url: "Stores",
    method: "get"
  })
}
