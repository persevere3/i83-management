import { request } from "@/utils/service"
import type * as Select from "./types/select"

/** 增 */
export function createSelectDataApi(data: Select.CreateSelectRequestData) {
  return request({
    url: "table",
    method: "post",
    data
  })
}

/** 删 */
export function deleteSelectDataApi(id: string) {
  return request({
    url: `table/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateSelectDataApi(data: Select.UpdateSelectRequestData) {
  return request({
    url: "table",
    method: "put",
    data
  })
}

/** 查 */
export function getSelectDataApi(params: Select.GetSelectRequestData) {
  // Select.GetSelectResponseData ???
  return request<Select.GetSelectResponseData>({
    url: "table",
    method: "get",
    params
  })
}
