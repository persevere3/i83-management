import { request, requestProd } from "@/utils/service"
import type * as Meal from "./types/meal"

/** 增 */
export function createMealDataApi(data: any) {
  return requestProd({
    url: "Products",
    method: "post",
    data
  })
}
// export function createMealDataApi(data: Meal.CreateMealRequestData) {
//   return request({
//     url: "/api/Product",
//     method: "post",
//     data
//   })
// }

/** 删 */
export function deleteMealDataApi(id: number) {
  return requestProd({
    url: `Products/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateMealDataApi(data: Meal.UpdateMealRequestData) {
  return request({
    url: `Products/${data}`,
    method: "put",
    data
  })
}

/** 查 */
export function getMealDataApi(params: Meal.GetMealRequestData) {
  return requestProd<Meal.GetMealResponseData>({
    url: "Products",
    method: "get",
    params
  })
}
// export function getMealDataApi(params: Meal.GetMealRequestData) {
//   // Meal.GetMealResponseData ???
//   return request<Meal.GetMealResponseData>({
//     url: "table",
//     method: "get",
//     params
//   })
// }
