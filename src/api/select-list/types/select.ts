// interface option {
//   optionName: string
//   optionPrice: number
// }

export interface CreateSelectRequestData {
  selectName: string
  optionList: string[]
}

export interface UpdateSelectRequestData {
  selectName: string
  optionList: string[]
}

export interface GetSelectRequestData {
  /** 当前页码 */
  // currentPage: number
  /** 查询条数 */
  // size: number

  /** 查询参数：分類名稱 */
  selectName?: string
}

export interface GetSelectData {
  selectName: string
  optionList: string[]
}

export type GetSelectResponseData = ApiResponseData<{
  list: GetSelectData[]
  total: number
}>
