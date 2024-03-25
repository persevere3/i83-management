import { requestJson } from "@/utils/service"
import type * as Category from "./types/category"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
const { activeStore } = storeToRefs(useCommonStore())

/** 增 */
export function createDataApi(data: Category.CreateReqData) {
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
    url: `Categories/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Category.ReadResData>({
    url: `Categories${activeStore.value?.id !== 0 ? `?storeId=${activeStore.value?.id}` : ""}`,
    method: "get"
  })
}
