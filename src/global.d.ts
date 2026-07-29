declare global {
  interface Window {
    Sanitizer: any
    onTelegramAuth: (user: any) => void
  }
  interface Element {
    setHTML: any
  }
}

export {}
