import { createDirective } from '@/utils/createDirective'

/**
 * 长按
 *
 * @param {number} delay 长按多久算长按，单位ms，默认 100
 */
export const longPress = createDirective<HTMLElement, number>({})
