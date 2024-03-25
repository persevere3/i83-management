export interface LoginRequestData {
  name: string
  /** 密码 */
  password: string
  /** 验证码 */
  // code: string
}

// export type LoginCodeResponseData = ApiResponseData<string>

export interface Store {
  id: number
  storeName: string
}
export type LoginResponseData = {
  data: {
    token: string
    storeList: Store[]
  }
}

// export type UserInfoResponseData = ApiResponseData<{ username: string; roles: string[] }>
