import { PATH } from '@/services/path'
import { ServerError } from '@/services/ServerError'
import { requestHttp } from '@/services/transport/http'

import { accessTokenStorage, refreshTokenStorage } from './tokenStorage'

import type { RefreshTokenRequest, SessionCredentials } from './types'

const INVALID_REFRESH_TOKEN_STATUSES: Record<number, true> = { [-100]: true, 404: true }
let refreshRequest: Promise<string | undefined> | null = null

export async function refreshSessionToken(refreshToken: string): Promise<string> {
  const token = await requestHttp<string, RefreshTokenRequest>(PATH.USER_REFRESH_TOKEN, {
    payload: { token: refreshToken },
  })
  accessTokenStorage.set(token)
  return token
}

export async function getSessionToken(): Promise<string | undefined> {
  const accessToken = accessTokenStorage.get()
  if (accessToken) return accessToken
  if (refreshRequest) return refreshRequest

  const refreshToken = await refreshTokenStorage.get()
  if (!refreshToken) return undefined
  if (refreshRequest) return refreshRequest

  const request = refreshSessionToken(refreshToken).catch(async (error: unknown) => {
    if (error instanceof ServerError && INVALID_REFRESH_TOKEN_STATUSES[error.status]) {
      await clearSessionCredentials()
      return undefined
    }
    throw error
  })
  refreshRequest = request
  try {
    return await request
  } finally {
    if (refreshRequest === request) refreshRequest = null
  }
}

export async function storeSessionCredentials(credentials: SessionCredentials): Promise<void> {
  accessTokenStorage.set(credentials.Token)
  await refreshTokenStorage.set(credentials.RefreshToken)
}

export async function clearSessionCredentials(): Promise<void> {
  accessTokenStorage.set('')
  await refreshTokenStorage.set('')
}

export async function hasSessionCredentials(): Promise<boolean> {
  return Boolean(accessTokenStorage.get() || (await refreshTokenStorage.get()))
}

export async function setRefreshToken(token: string): Promise<void> {
  accessTokenStorage.set('')
  await refreshTokenStorage.set(token)
}
