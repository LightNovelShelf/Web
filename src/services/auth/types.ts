export interface SessionCredentials {
  RefreshToken: string
  Token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  userName: string
  email: string
  password: string
  code: string
  inviteCode: string
}

export interface RefreshTokenRequest {
  token: string
}
