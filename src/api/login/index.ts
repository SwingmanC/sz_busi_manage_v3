import { busiRequest } from "@/utils/service"

export function loginApi(username: string, password: string) {
  return busiRequest({
    url: "/user/login",
    method: "post",
    params: {
      username,
      password
    }
  })
}
