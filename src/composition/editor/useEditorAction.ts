import { useQuasar } from 'quasar'
import { ref } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { confirmEditorHtmlSave } from '@/components/html/editorSaveGuard'

export interface EditorActionOptions {
  content?: string
  confirmWhenClean?: boolean
  successMessage?: string
}

export function useEditorAction() {
  const quasar = useQuasar()
  const saving = ref(false)

  async function runEditorAction(options: EditorActionOptions, action: () => Promise<unknown>): Promise<boolean> {
    if (saving.value) return false
    saving.value = true
    try {
      if (
        options.content !== undefined &&
        !(await confirmEditorHtmlSave(options.content, options.confirmWhenClean ?? false))
      ) {
        return false
      }

      await action()
      quasar.notify({ type: 'positive', message: options.successMessage ?? '修改成功' })
      return true
    } catch (error) {
      quasar.notify({ type: 'negative', message: getErrMsg(error) })
      return false
    } finally {
      saving.value = false
    }
  }

  return { saving, runEditorAction }
}
