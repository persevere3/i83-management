import { requestJson, requestGenerate } from "@/utils/service"
import type * as Table from "./types/table"

/** 增 */
export function createDataApi(data: Table.CreateReqData) {
  return requestJson({
    url: "Tables",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDataApi(ids: number[]) {
  return requestJson({
    url: `Tables`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateDataApi(data: Table.UpdateReqData) {
  return requestJson({
    url: `Tables/${data.id}`,
    method: "put",
    data
  })
}

export function enableApi(tableId: number) {
  return requestGenerate({
    url: `GenetateOrder/${tableId}`,
    method: "get"
  })
}

/** 查 */
export function getDataApi() {
  return requestJson<Table.ReadResData>({
    url: "Tables",
    method: "get"
  })
}
