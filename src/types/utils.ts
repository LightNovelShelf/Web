/** 空函数 */
export type AnyVoidFunc = () => void

/** 任意输入输出函数 */
export type AnyFunc<Params extends any[] = any[], Return = any> = (...param: Params) => Return
/** 任意异步输入输出函数 */
export type AnyAsyncFunc<Params extends any[] = any[], Return extends Promise<any> = Promise<any>> = (
  ...param: Params
) => Return
