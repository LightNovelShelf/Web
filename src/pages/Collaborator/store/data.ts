import type { Card } from 'src/types/collaborator'
import { nanoid } from 'nanoid'

const imgs: string[] = [
  'https://img.acgdmzy.com:45112/images/2021/08/22/08579907e581.webp',
  'https://i0.hdslb.com/bfs/archive/307afe2558b4bb3a4a655d284a47459b9c6cd3fa.jpg',
  'https://i0.hdslb.com/bfs/bangumi/image/8b1657cc9ded02796ce317ff7e1fd36f2dc9a0bb.jpg',
  'https://i0.hdslb.com/bfs/manga-static/1cecbe6033d31cc9a49f4c1df88258a0abf72e07.jpg',
  'https://i0.hdslb.com/bfs/archive/ab734a5ec06f568c27ea2212bbfb5e22d31284ae.jpg',
]

const mock = (): Card[] => {
  return new Array(40).fill('').map((_, idx) => {
    return {
      Id: nanoid(),
      Job: 'Epub',
      Avatar: imgs[idx % imgs.length],
      Title: nanoid(idx % 2 === 1 ? 40 : 6),
      Description: nanoid(idx % 2 === 1 ? 40 : 6),
    }
  })
}

/** 固化本地的贡献者列表数据 */
export const collaborators = mock()
