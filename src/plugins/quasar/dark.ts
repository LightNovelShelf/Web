const Key: string = (VUE_APP_NAME || 'eBook_Shelf') + '_Dark'

/** Dark设置 */
export const Dark = {
  get(): 'auto' | boolean {
    const result = localStorage.getItem(Key)
    console.log(result)
    if (result) {
      if (result === 'true') return true
      else if (result === 'false') return false
      else return 'auto'
    } else {
      return 'auto'
    }
  },
  set(value: 'auto' | boolean) {
    localStorage.setItem(Key, `${value}`)
  }
}
