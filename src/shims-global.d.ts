declare global {
  interface Window {
    Sanitizer: any
  }
  interface Element {
    setHTML: any
  }
}

// extend global 需要 .d.ts 是一个module
// @url https://stackoverflow.com/questions/47736473/how-to-define-global-function-in-typescript/47736563#47736563
export {}
