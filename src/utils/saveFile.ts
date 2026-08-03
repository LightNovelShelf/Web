/** 把拿到的二进制保存为本地文件 */
export function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()

  // 立刻 revoke 在部分浏览器会中断下载，放到下一轮事件循环
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
