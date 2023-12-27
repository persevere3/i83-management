export interface CreateTableRequestData {
  id: number | string
  storeName: string
  number: string
  orderToken: string | null
  enable: number
}

export interface UpdateTableRequestData {
  id: number | string
  storeName: string
  number: string
  orderToken: string | null
  enable: number
}

export interface GetTableRequestData {
  /** 当前页码 */
  // currentPage: number
  /** 查询条数 */
  // size: number

  /** 查询参数：桌號名稱 */
  number?: number | string
}

export interface GetTableData {
  id: number | string
  storeName: string
  number: string
  orderToken: string | null
  enable: number
}

export type GetTableResponseData = GetTableData[]
