import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'
import { saveFile } from '@/utils/saveFile'

import { useSessionStore } from '@/stores/session'

import { downloadBook, downloadChapter } from '@/services/book'

/**
 * 下载书籍，带进度提示
 *
 * 小说按 bid 整本导出 epub，漫画按 chapter id 单话导出 cbz
 */
export function useBookDownload(target: 'book' | 'chapter' = 'book') {
  const $q = useQuasar()
  const sessionStore = useSessionStore()
  /** 正在下载的 id，用于按钮各自的 loading */
  const downloadingId = ref<number | null>(null)
  const balance = computed(() => sessionStore.user?.Growth?.Coin ?? 0)

  /** 扣费前的确认，cost 为 0（管理下载权限或自己的书）直接放行 */
  const confirmCost = (cost: number) =>
    new Promise<boolean>((resolve) => {
      if (!cost) return resolve(true)

      // 余额只是本地快照，服务端仍会再判一次；这里拦掉注定 402 的请求
      if (balance.value < cost) {
        $q.dialog({
          title: '金币不足',
          message: `本次下载需要 <b>${cost}</b> 金币，你当前只有 <b>${balance.value}</b> 枚，还差 ${cost - balance.value} 枚。`,
          html: true,
        }).onDismiss(() => resolve(false))
        return
      }

      $q.dialog({
        title: '下载确认',
        message:
          `本次下载将消耗 <b>${cost}</b> 金币，当前余额 ${balance.value}。` +
          `<br class="q-mb-xs" /><span class="text-caption text-grey">2 小时内重复下载不再扣费。</span>`,
        html: true,
        cancel: true,
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
    })

  const download = async (id: number, cost = 0) => {
    if (downloadingId.value !== null) return
    if (!(await confirmCost(cost))) return
    downloadingId.value = id

    const notify = $q.notify({
      message: '正在准备文件',
      color: 'primary',
      timeout: 0,
      spinner: true,
      group: false,
    })

    try {
      const request = target === 'chapter' ? downloadChapter : downloadBook
      const { blob, fileName } = await request(id, {
        onProgress: (loaded, total) => {
          const size = `${(loaded / 1024 / 1024).toFixed(1)} MB`
          notify({
            message: total ? `已下载 ${size} / ${(total / 1024 / 1024).toFixed(1)} MB` : `已下载 ${size}`,
          })
        },
      })
      saveFile(blob, fileName)
    } catch (error) {
      $q.notify({
        message: getErrMsg(error),
        color: 'negative',
        timeout: 1500,
      })
    } finally {
      notify()
      downloadingId.value = null
    }
  }

  return { downloadingId, download }
}
