import { requestJson } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
// export function getLoginCodeApi() {
//   return request<Login.LoginCodeResponseData>({
//     url: "login/code",
//     method: "get"
//   })
// }

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return requestJson<Login.LoginResponseData>({
    url: "AccountInfoes/Login",
    method: "post",
    data
  })
}

/** 获取用户详情 */
// export function getUserInfoApi() {
//   return request<Login.UserInfoResponseData>({
//     url: "users/info",
//     method: "get"
//   })
// }
