export interface CreateCategoryRequestData {
  categoryName: string
  categoryText: string
}

export interface UpdateCategoryRequestData {
  categoryName: string
  categoryText: string
}

export interface GetCategoryRequestData {
  /** 当前页码 */
  // currentPage: number
  /** 查询条数 */
  // size: number

  /** 查询参数：分類名稱 */
  categoryName?: string
}

export interface GetCategoryData {
  categoryName: string
  categoryText: string
}

export type GetCategoryResponseData = ApiResponseData<{
  list: GetCategoryData[]
  total: number
}>
