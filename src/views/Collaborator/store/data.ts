import { Card } from '@/types/collaborator'
import { nanoid } from 'nanoid'

const imgs: string[] = [
  'https://img.acgdmzy.com:45112/images/2021/08/22/08579907e581.webp',
  'https://i2.hdslb.com/bfs/archive/307afe2558b4bb3a4a655d284a47459b9c6cd3fa.jpg'
]

const mock = (): Card[] => {
  return new Array(40).fill('').map((_, idx) => {
    return {
      key: nanoid(),
      id: nanoid(),
      avast: imgs[idx % imgs.length],
      nickname: nanoid(idx % 2 === 1 ? 40 : 6),
      bio: nanoid(idx % 2 === 1 ? 40 : 6)
    }
  })
}

/** 固化本地的贡献者列表数据 */
export const collaborators = mock()
