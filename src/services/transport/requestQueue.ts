import { RateLimitQueue } from '@/utils/rateLimitQueue'

const REQUEST_LIMIT = 9
const REQUEST_WINDOW_MS = 5_500

export const requestQueue = new RateLimitQueue(REQUEST_LIMIT, REQUEST_WINDOW_MS)
