import { AnyFunc, AnyVoidFunc } from '@/types/utils'
import { Directive } from 'vue'

/**
 * 没逻辑作用，主要是为了 type-safe
 *
 * T是指可以用在什么元素上
 * V是指可以赋什么值给这个 directive
 *
 * @example
 * ```js
 * createDirective<HTMLElement, number>({}) // 指只能用在 HTMLElement 上, 使用时只能赋值number
 * createDirective<HTMLElement | SVGElement, undefined>({}) // 指能用在 HTMLElement 或者 SVGElement 上, 不接受任何赋值
 * ```
 */
export function createDirective<T = HTMLElement, V = any, D extends Directive<T, V> = Directive<T, V>>(i: D): D {
  return i
}
