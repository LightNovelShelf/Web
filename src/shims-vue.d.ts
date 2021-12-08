declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'minimasonry' {
  const foo: any
  export default foo
}
