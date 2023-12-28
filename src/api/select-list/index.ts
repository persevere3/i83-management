import { requestCommon } from "@/utils/service"
import type * as Select from "./types/select"

/** 增 */
export function createSelectDataApi(data: Select.CreateSelectRequestData) {
  return requestCommon({
    url: "Options",
    method: "post",
    data
  })
}

/** 删 */
export function deleteSelectDataApi(ids: (number | string)[]) {
  return requestCommon({
    url: `Options`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateSelectDataApi(data: Select.UpdateSelectRequestData) {
  return requestCommon({
    url: `Options/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getSelectDataApi(params: Select.GetSelectRequestData) {
  // Select.GetSelectResponseData ???
  return requestCommon<Select.GetSelectResponseData>({
    url: "Options",
    method: "get",
    params
  })
}
