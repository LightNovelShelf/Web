import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { WritableComputedRef } from 'vue'
import type { LocationQueryValue } from 'vue-router'

/** query 参数与值的互转；serialize 返回 null 表示该参数不出现在 url 上 */
export interface QueryCodec<T> {
  parse(raw: string | null): T
  serialize(value: T): string | null
}

function readRaw(value: LocationQueryValue | LocationQueryValue[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ?? null
}

/** 取默认值时从 url 上抹掉，url 里只留非默认参数 */
export function stringQuery<T extends string>(fallback: T, allowed?: readonly T[]): QueryCodec<T> {
  return {
    parse(raw) {
      if (raw === null) return fallback
      if (allowed && !allowed.includes(raw as T)) return fallback
      return raw as T
    },
    serialize: (value) => (value === fallback ? null : value),
  }
}

export function numberQuery(fallback: number): QueryCodec<number> {
  return {
    parse: (raw) => ~~`${raw ?? ''}` || fallback,
    serialize: (value) => (value === fallback ? null : `${value}`),
  }
}

export function nullableNumberQuery(): QueryCodec<number | null> {
  return {
    parse(raw) {
      if (raw === null || raw === '') return null
      const value = Number(raw)
      return Number.isNaN(value) ? null : value
    },
    serialize: (value) => (value === null ? null : `${value}`),
  }
}

/**
 * 把一个状态挂到 url query 上
 *
 * @description 读走 route.query，写走 router.push，因此刷新、前进后退都能恢复
 */
export function useQueryState<T>(key: string, codec: QueryCodec<T>): WritableComputedRef<T> {
  const route = useRoute()
  const router = useRouter()

  return computed<T>({
    get: () => codec.parse(readRaw(route.query[key])),
    set: (value) => {
      const raw = codec.serialize(value)
      const query = { ...route.query }
      if (raw === null) delete query[key]
      else query[key] = raw

      void router.push({ query })
    },
  })
}

/** 一次改多个 query 参数，只产生一条历史记录 */
export function useQueryPatch() {
  const route = useRoute()
  const router = useRouter()

  return (patch: Record<string, string | null>) => {
    const query = { ...route.query }
    for (const [key, raw] of Object.entries(patch)) {
      if (raw === null) delete query[key]
      else query[key] = raw
    }

    void router.push({ query })
  }
}
