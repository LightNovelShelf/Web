import { requestWithFetch } from '@/services/internal/request'

const HOST = `${process.env.VUE_APP_API_SERVER}/api/user/`

export function login(email: string, password: string, token: string) {
  const data = { email, password, token }
  return requestWithFetch(HOST + 'login', {
    method: 'POST',
    data
  })
}
