import { requestCommon, requestGenerate } from "@/utils/service"
import type * as Table from "./types/table"

/** 增 */
export function createTableDataApi(data: Table.CreateTableRequestData) {
  return requestCommon({
    url: "Tables",
    method: "post",
    data
  })
}
export function openPayApi(tableId: number | string) {
  return requestGenerate({
    url: `GenetateOrder/${tableId}`,
    method: "get"
  })
}

/** 删 */
export function deleteTableDataApi(ids: (number | string)[]) {
  return requestCommon({
    url: `Tables`,
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateTableDataApi(data: Table.UpdateTableRequestData) {
  return requestCommon({
    url: `Tables/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Table.GetTableRequestData) {
  // Table.GetTableResponseData ???
  return requestCommon<Table.GetTableResponseData>({
    url: "Tables",
    method: "get",
    params
  })
}
