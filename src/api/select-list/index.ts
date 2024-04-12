import { requestJson } from "@/utils/service"
import type * as Select from "./types/select"

/** 增 */
export function createDataApi(data: Select.CreateReqData) {
  return requestJson({
    url: "Options",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: number[]) {
  return requestJson({
    url: `Options`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateDataApi(data: Select.UpdateReqData) {
  return requestJson({
    url: `Options/${data.id}`,
    method: "put",
    data
  })
}

export function updateSelectOrderApi(data: any) {
  return requestJson({
    url: `Options/ModifyOptionOrder`,
    method: "post",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Select.ReadResData>({
    url: "Options",
    method: "get"
  })
}
