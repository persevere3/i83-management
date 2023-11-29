import { request } from "@/utils/service"
import type * as Category from "./types/category"

/** 增 */
export function createCategoryDataApi(data: Category.CreateCategoryRequestData) {
  return request({
    url: "table",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: string) {
  return request({
    url: `table/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateTableDataApi(data: Category.UpdateCategoryRequestData) {
  return request({
    url: "table",
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Category.GetCategoryRequestData) {
  // Category.GetCategoryResponseData ???
  return request<Category.GetCategoryResponseData>({
    url: "table",
    method: "get",
    params
  })
}
