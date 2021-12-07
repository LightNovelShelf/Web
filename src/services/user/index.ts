import { requestWithFetch } from '@/services/internal/request'
import { LoginRes } from '@/services/user/type'

const HOST = `${process.env.VUE_APP_API_SERVER}/api/user/`

export function login(email: string, password: string, token: string) {
  const data = { email, password, token }
  return requestWithFetch(HOST + 'login', {
    method: 'POST',
    data
  })
}

export function refreshToken(token: string) {
  const data = { token }
  return requestWithFetch(HOST + 'refresh_token', {
    method: 'POST',
    data
  })
}
