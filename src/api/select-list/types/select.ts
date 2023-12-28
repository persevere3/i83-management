// interface option {
//   optionName: string
//   optionPrice: number
// }

export interface CreateSelectRequestData {
  id: number
  title: string
  optionList: string
  max: number
  min: number
}

export interface UpdateSelectRequestData {
  id: number
  title: string
  optionList: string
  max: number
  min: number
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
  id: number
  title: string
  optionList: string
  max: number
  min: number
}

export type GetSelectResponseData = GetSelectData[]
