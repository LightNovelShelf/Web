declare global {
  interface Window {
    turnstile: any
    Sanitizer: any
    onloadTurnstileCallback: () => void
    onTelegramAuth: (user: any) => void
  }
  interface Element {
    setHTML: any
  }
}

export {}
