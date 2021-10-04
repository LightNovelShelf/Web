/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'masonry-layout' {
  class masonry {
    constructor(
      node: string | HTMLElement,
      opt?: {
        /** 选择器 */
        itemSelector?: string
        /** 间隔 */
        gutter?: number
        /** 容器符合内容宽度方便居中 */
        fitWidth?: boolean
        /** 设置fitWidth后 columnWidth 需要设置为 数字宽度 */
        columnWidth?: number
      }
    )
    layout(): void
    destroy(): void
  }

  export default masonry
}
