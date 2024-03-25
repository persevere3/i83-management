import { requestFormData, requestJson } from "@/utils/service"
import type * as Meal from "./types/meal"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
const { activeStore } = storeToRefs(useCommonStore())

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
export function updateBranchEnableApi(data: Meal.UpdateEnableReqData) {
  return requestJson({
    url: `Stores/StoreUpdateProducts`,
    method: "post",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Meal.ReadResData>({
    url: `Products${activeStore.value?.id !== 0 ? `?storeId=${activeStore.value?.id}` : ""}`,
    method: "get"
  })
}
