export type MangaStatus = '连载中' | '已完结'

export interface MangaChapter {
  id: string
  number: number
  title: string
  publishedAt: string
  pages: number
  free: boolean
}

export interface MangaTheme {
  primary: string
  secondary: string
  accent: string
  ink: string
}

export interface Manga {
  id: string
  title: string
  subtitle: string
  author: string
  artist: string
  status: MangaStatus
  tags: string[]
  description: string
  score: number
  followers: string
  views: string
  weeklyRank: number
  latestUpdate: string
  updatedAt: string
  theme: MangaTheme
  chapters: MangaChapter[]
}

const chapterNames = [
  '雨幕中的列车',
  '第七码头的来客',
  '不会熄灭的灯',
  '来自旧城区的信',
  '星轨偏移三厘米',
  '无人知晓的约定',
  '越过风暴之后',
  '向着黎明出发',
]

function createChapters(prefix: string, count: number): MangaChapter[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `${prefix}-${number}`,
      number,
      title: chapterNames[index % chapterNames.length],
      publishedAt: `2026-${String(7 - Math.floor(index / 3)).padStart(2, '0')}-${String(18 - (index % 8)).padStart(2, '0')}`,
      pages: 10 + (index % 5),
      free: number <= 4,
    }
  })
}

export const mangas: Manga[] = [
  {
    id: 'night-train',
    title: '夜行列车抵达星海',
    subtitle: 'THE NIGHT TRAIN TO STARDUST',
    author: '北川遥',
    artist: '青鸟工作室',
    status: '连载中',
    tags: ['奇幻', '冒险', '治愈'],
    description:
      '失去故乡记忆的少女澄夏，登上一辆只在午夜出现的列车。每一站都是一段被遗忘的故事，而终点站据说藏着让星星重新亮起的方法。',
    score: 9.7,
    followers: '12.8万',
    views: '286.4万',
    weeklyRank: 1,
    latestUpdate: '更新至第 18 话',
    updatedAt: '2026-07-18T22:00:00+08:00',
    theme: { primary: '#1b2344', secondary: '#634d91', accent: '#f1c979', ink: '#eef1ff' },
    chapters: createChapters('night-train', 18),
  },
  {
    id: 'summer-echo',
    title: '夏日回声',
    subtitle: 'ECHOES OF SUMMER',
    author: '林浅',
    artist: '薄荷绘社',
    status: '已完结',
    tags: ['青春', '校园', '恋爱'],
    description: '在海边小镇的最后一个暑假，四个少年用旧录音机留下秘密，也终于学会与离别和解。',
    score: 9.4,
    followers: '8.6万',
    views: '172.3万',
    weeklyRank: 5,
    latestUpdate: '全 24 话',
    updatedAt: '2026-06-20T18:30:00+08:00',
    theme: { primary: '#1e7183', secondary: '#6fc0bd', accent: '#ffe48a', ink: '#f8ffff' },
    chapters: createChapters('summer-echo', 24),
  },
  {
    id: 'blade-bloom',
    title: '刃上花',
    subtitle: 'BLOOM ON THE BLADE',
    author: '九野',
    artist: '赤羽',
    status: '连载中',
    tags: ['古风', '动作', '悬疑'],
    description: '以花为刃的无名剑客，为寻找失落的十二幅山河图，踏入一场横跨三代人的江湖谜局。',
    score: 9.5,
    followers: '10.2万',
    views: '241.7万',
    weeklyRank: 2,
    latestUpdate: '更新至第 31 话',
    updatedAt: '2026-07-19T08:15:00+08:00',
    theme: { primary: '#3b1718', secondary: '#943d3b', accent: '#eabf8c', ink: '#fff7ed' },
    chapters: createChapters('blade-bloom', 31),
  },
  {
    id: 'cloud-cafe',
    title: '云端咖啡店',
    subtitle: 'CAFÉ ABOVE THE CLOUDS',
    author: '山岚',
    artist: '木棉',
    status: '连载中',
    tags: ['日常', '治愈', '轻喜剧'],
    description: '城市最高处有一家只为迷路的人营业的咖啡店，一杯饮品，可以换一个重新出发的答案。',
    score: 9.2,
    followers: '6.4万',
    views: '128.9万',
    weeklyRank: 8,
    latestUpdate: '更新至第 15 话',
    updatedAt: '2026-07-14T20:00:00+08:00',
    theme: { primary: '#6a5b4d', secondary: '#b49573', accent: '#dce4c2', ink: '#fffaf1' },
    chapters: createChapters('cloud-cafe', 15),
  },
  {
    id: 'zero-city',
    title: '零号城协议',
    subtitle: 'PROTOCOL: CITY ZERO',
    author: '银格',
    artist: '像素风暴',
    status: '连载中',
    tags: ['科幻', '赛博朋克', '剧情'],
    description: '人工智能接管城市后的第七年，一名维修员发现自己的记忆竟是整座城市最后一道离线备份。',
    score: 9.6,
    followers: '11.1万',
    views: '265.8万',
    weeklyRank: 3,
    latestUpdate: '更新至第 22 话',
    updatedAt: '2026-07-17T21:10:00+08:00',
    theme: { primary: '#101a2f', secondary: '#255f83', accent: '#63f2ce', ink: '#eaffff' },
    chapters: createChapters('zero-city', 22),
  },
  {
    id: 'fox-letter',
    title: '狐狸邮差与月亮信箱',
    subtitle: 'LETTERS TO THE MOON',
    author: '星川',
    artist: '小森日和',
    status: '已完结',
    tags: ['童话', '治愈', '幻想'],
    description: '狐狸邮差每晚把寄不到的信送往月亮，直到某天，他收到一封写给自己的信。',
    score: 9.8,
    followers: '15.3万',
    views: '319.6万',
    weeklyRank: 4,
    latestUpdate: '全 16 话',
    updatedAt: '2026-05-30T18:45:00+08:00',
    theme: { primary: '#294351', secondary: '#d07155', accent: '#f6dd96', ink: '#fffaf0' },
    chapters: createChapters('fox-letter', 16),
  },
]

export const featuredManga = mangas[0]

export function getManga(id: string) {
  return mangas.find((manga) => manga.id === id) ?? mangas[0]
}

export function getChapter(manga: Manga, chapterId: string) {
  return manga.chapters.find((chapter) => chapter.id === chapterId) ?? manga.chapters[0]
}
