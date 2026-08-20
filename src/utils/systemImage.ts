import { decode } from 'blurhash'

import { getImageSize, getPlaceholder, withImageHeight } from './url'

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

function applySystemImageBlurHash(image: HTMLImageElement, url: string): void {
  const placeholder = getPlaceholder(url)
  if (!placeholder) return
  const [width, height] = getImageSize(url) ?? [2, 3]
  const dataUrl = placeholderDataUrl(placeholder, width, height)
  if (!dataUrl) return
  image.style.backgroundImage = `url("${dataUrl}")`
  image.style.backgroundPosition = 'center'
  image.style.backgroundSize = 'cover'
}

export function prepareSystemImages(root: ParentNode, requestHeight: number): void {
  root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const originalUrl = image.dataset.systemImageUrl ?? image.getAttribute('src') ?? ''
    const placeholder = getPlaceholder(originalUrl)
    if (!placeholder) return

    image.dataset.systemImageUrl = originalUrl
    const [width, height] = getImageSize(originalUrl) ?? [2, 3]
    image.src = withImageHeight(originalUrl, requestHeight)
    image.setAttribute('width', String(width))
    image.setAttribute('height', String(height))
    applySystemImageBlurHash(image, originalUrl)

    if (!image.style.width) {
      image.dataset.systemImagePrefillWidth = 'true'
      const widthByHeight = Number((width / height).toFixed(6))
      image.style.width = `min(${width}px, 100%, calc(var(--flip-height, 100000px) * ${widthByHeight}))`
    }
  })
}

function clearImageLoadingState(image: HTMLImageElement): void {
  if (!image.dataset.systemImageUrl) return
  if (image.dataset.systemImagePrefillWidth) {
    image.style.removeProperty('width')
    delete image.dataset.systemImagePrefillWidth
  }
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
