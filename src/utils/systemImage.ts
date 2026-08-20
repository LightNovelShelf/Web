import { decode } from 'blurhash'

import { getSystemImageMetadata, withImageHeight } from './url'

const placeholderCache = new Map<string, string>()

function placeholderDataUrl(hash: string, width: number, height: number): string | null {
  const decodingWidth = 24
  const decodingHeight = Math.min(64, Math.max(12, Math.round((decodingWidth * height) / width)))
  const key = `${hash}:${decodingWidth}x${decodingHeight}`
  const cached = placeholderCache.get(key)
  if (cached) return cached

  try {
    const canvas = document.createElement('canvas')
    canvas.width = decodingWidth
    canvas.height = decodingHeight
    const context = canvas.getContext('2d')
    if (!context) return null
    const imageData = context.createImageData(decodingWidth, decodingHeight)
    imageData.data.set(decode(hash, decodingWidth, decodingHeight))
    context.putImageData(imageData, 0, 0)
    const dataUrl = canvas.toDataURL()
    placeholderCache.set(key, dataUrl)
    return dataUrl
  } catch {
    return null
  }
}

function applySystemImageBlurHash(image: HTMLImageElement, placeholder: string, width: number, height: number): void {
  const dataUrl = placeholderDataUrl(placeholder, width, height)
  if (!dataUrl) return
  image.style.backgroundImage = `url("${dataUrl}")`
  image.style.backgroundPosition = 'center'
  image.style.backgroundSize = 'cover'
}

export function prepareSystemImages(root: ParentNode, requestHeight: number): void {
  root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const originalUrl = image.dataset.systemImageUrl ?? image.getAttribute('src') ?? ''
    const metadata = getSystemImageMetadata(originalUrl)
    if (!metadata) return

    image.dataset.systemImageUrl = originalUrl
    const { placeholder, width, height } = metadata
    image.src = withImageHeight(originalUrl, requestHeight)
    image.setAttribute('width', String(width))
    image.setAttribute('height', String(height))
    image.style.aspectRatio = `${width} / ${height}`
    applySystemImageBlurHash(image, placeholder, width, height)

    if (!image.style.width) {
      image.dataset.systemImagePrefillWidth = 'true'
      const widthByHeight = Number((width / height).toFixed(6))
      image.style.width = `min(${width}px, 100%, calc(var(--flip-height, 100000px) * ${widthByHeight}))`
    }
  })
}

function clearImageLoadingState(image: HTMLImageElement): void {
  if (!image.dataset.systemImageUrl) return
  if (image.dataset.systemImagePrefillWidth) delete image.dataset.systemImagePrefillWidth
  image.style.removeProperty('background-image')
  image.style.removeProperty('background-position')
  image.style.removeProperty('background-size')
  delete image.dataset.systemImageUrl
}

export function clearSystemImageLoadingState(event: Event): void {
  if (event.target instanceof HTMLImageElement) clearImageLoadingState(event.target)
}

export function clearLoadedSystemImageStates(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    if (image.complete && image.naturalWidth > 0) clearImageLoadingState(image)
  })
}
