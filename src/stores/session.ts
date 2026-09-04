import { defineStore } from 'pinia'

import { hasSessionCredentials } from '@/services/auth/session'
import { getMyInfo } from '@/services/user'

import type { Growth } from '@/services/points'
import type { CurrentUser } from '@/services/user/type'

let currentUserRequest: Promise<CurrentUser> | null = null
let sessionVersion = 0

export const useSessionStore = defineStore('app.session', {
  state: () => ({
    user: null as CurrentUser | null,
  }),
  getters: {
    userId: (state): number => state.user?.Id ?? 0,
    avatar: (state): string => state.user?.Avatar ?? '',
  },
  actions: {
    async refreshUser(): Promise<CurrentUser> {
      if (!currentUserRequest) {
        const version = sessionVersion
        const request = getMyInfo()
          .then((user) => {
            if (version === sessionVersion) this.user = user
            return user
          })
          .finally(() => {
            if (currentUserRequest === request) currentUserRequest = null
          })
        currentUserRequest = request
      }
      return currentUserRequest
    },
    async restoreUser(): Promise<CurrentUser | null> {
      if (!(await hasSessionCredentials())) return null
      return this.refreshUser()
    },
    clearUser(): void {
      sessionVersion += 1
      currentUserRequest = null
      this.user = null
    },
    applyGrowth(growth: Growth): { expDelta: number; coinDelta: number } | null {
      if (!this.user) return null

      const expDelta = growth.Exp - (this.user.Growth?.Exp ?? growth.Exp)
      const coinDelta = growth.Coin - (this.user.Growth?.Coin ?? growth.Coin)
      this.user.Growth = growth
      this.user.Level = growth.Level
      return { expDelta, coinDelta }
    },
  },
})
