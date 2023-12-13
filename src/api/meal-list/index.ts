import { request } from "@/utils/service"
import type * as Meal from "./types/meal"

/** 增 */
export function createMealDataApi(data: Meal.CreateMealRequestData) {
  return request({
    url: "table",
    method: "post",
    data
  })
}

/** 删 */
export function deleteMealDataApi(id: string) {
  return request({
    url: `table/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateMealDataApi(data: Meal.UpdateMealRequestData) {
  return request({
    url: "table",
    method: "put",
    data
  })
}

/** 查 */
export function getMealDataApi(params: Meal.GetMealRequestData) {
  // Meal.GetMealResponseData ???
  return request<Meal.GetMealResponseData>({
    url: "table",
    method: "get",
    params
  })
}
