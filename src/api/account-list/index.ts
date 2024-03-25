import { requestJson } from "@/utils/service"
import type * as Account from "./types/account"

/** 增 */
export function createDataApi(data: Account.CreateReqData) {
  return requestJson({
    url: `AccountInfoes`,
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(id: number) {
  return requestJson({
    url: `AccountInfoes/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateDataApi(data: Account.UpdateReqData) {
  const { id } = data
  return requestJson({
    url: `AccountInfoes/${id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Account.ReadResData>({
    url: "AccountInfoes",
    method: "get"
  })
}
