import { requestJson } from "@/utils/service"
import type * as PayMethod from "./types/payMethod"

/** 增 */
export function createDataApi(data: PayMethod.CreateReqData) {
  return requestJson({
    url: "PayInfoes",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: number[]) {
  return requestJson({
    url: `PayInfoes`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateDataApi(data: PayMethod.UpdateReqData) {
  return requestJson({
    url: `PayInfoes/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<PayMethod.ReadResData>({
    url: "PayInfoes",
    method: "get"
  })
}
