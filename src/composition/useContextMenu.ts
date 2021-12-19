import { nextTick, ref } from 'vue'
import { Vue3Menus, menusItemType } from 'vue3-menus'

/**
 * 右键菜单
 *
 * @example
 *
 * ```xml
 * <vue3-menus :open="isOpen" :event="mousrEvent" :menus="menus" />
 * ```
 *
 * ```ts
 * import { useContextMenu, Vue3Menus } from '@/composition/useContextMenu'
 *
 * const { isOpen, mousrEvent, menus, actions } = useContextMenu([{ label: '前进(F)', tip: 'Alt+向右箭头' }])
 *
 * const rightClick = (evt: MouseEvent) => {
 *    actins.open(evt)
 *    // 或者
 *    actions.open(evt, [{ label: '返回(B)', tip: 'Alt+向左箭头' }])
 * }
 *
 * defineComponent({ Vue3Menus })
 * ```
 */
export const useContextMenu = (menus: menusItemType[] = []) => {
  const isOpen = ref(false)
  const mousrEvent = ref<MouseEvent>({} as MouseEvent)
  const _menus = ref(menus)

  const open = (evt: MouseEvent, m = menus) => {
    close()
    evt.preventDefault()
    nextTick(() => {
      isOpen.value = true
      mousrEvent.value = evt
      _menus.value = m
    })
  }
  const close = () => {
    isOpen.value = false
    mousrEvent.value = {} as MouseEvent
  }

  return {
    /** 是否展示菜单 */
    isOpen,
    /** 菜单对应的事件（用来定位等） */
    mousrEvent,
    menus: _menus,
    /** 菜单操作 */
    actions: { open, close }
  }
}

export type { menusItemType }
export { Vue3Menus }
