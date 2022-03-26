const Key: string = (VUE_APP_NAME || 'eBook_Shelf') + '_Dark'

/** Dark设置 */
export const Dark = {
  get(): 'auto' | boolean {
    const result = localStorage.getItem(Key)
    switch (result) {
      case 'true':
        return true
      case 'false':
        return false
      default:
        return 'auto'
    }
  },
  set(value: 'auto' | boolean) {
    localStorage.setItem(Key, `${value}`)
  }
}
