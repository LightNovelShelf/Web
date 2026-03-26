import type {
  CommunityActiveUserItem,
  CommunityBoardKey,
  CommunityBoardSummary,
  CommunityFeedItem,
  CommunityFeedOrder,
  CommunityFeedScope,
  CommunityHomePayload,
  CommunityHotRankItem,
  CommunityListQuery,
  CommunityMyOverview,
  CommunityMyReplyItem,
  CommunityPagination,
  CommunityReplyTarget,
  CommunityThreadDetail,
  CommunityThreadReply,
  CreateCommunityReplyRequest,
  CreateCommunityThreadRequest,
  GetCommunityReplyChildrenRequest,
} from './types'

type BoardRecordKey = Exclude<CommunityBoardKey, 'all'>

interface BoardRecord {
  id: number
  key: BoardRecordKey
  title: string
  description: string
  icon: string
}

interface ThreadRecord {
  id: number
  boardKey: BoardRecordKey
  title: string
  excerpt: string
  authorName: string
  createdAt: number
  views: number
  likes: number
  favorites: number
  liked: boolean
  favorited: boolean
  tags: string[]
  bodyHtml: string
  featured?: boolean
  pinned?: boolean
  locked?: boolean
}

interface ReplyRecord {
  id: number
  threadId: number
  authorName: string
  authorBadge?: string
  createdAt: number
  content: string
  likes: number
  liked: boolean
  parentId?: number
  replyToId?: number
}

const boardRecords: BoardRecord[] = [
  { id: 1, key: 'anime', title: '动画', description: '新番、作画、剧情考据和角色讨论', icon: 'mdiVideo' },
  { id: 2, key: 'comic', title: '漫画', description: '连载追更、分镜表现和作者杂谈', icon: 'mdiImage' },
  { id: 3, key: 'game', title: '游戏', description: 'Gal、JRPG、抽卡玩法和剧情线讨论', icon: 'mdiController' },
  { id: 4, key: 'novel', title: '小说', description: '轻小说、网文和章节更新的读后感', icon: 'mdiBook' },
  { id: 5, key: 'website', title: '站务', description: '功能建议、站点反馈和社区活动公告', icon: 'mdiBullhorn' },
]

const activeUsers: CommunityActiveUserItem[] = [
  { id: 1, name: '阿澄', avatar: 'https://i.pravatar.cc/96?img=41', badge: '周活跃作者', score: 1280, summary: '本周发布 6 篇长评' },
  { id: 2, name: '玲珑', avatar: 'https://i.pravatar.cc/96?img=44', badge: '追更达人', score: 1120, summary: '连续 12 天参与讨论' },
  { id: 3, name: '弥生', avatar: 'https://i.pravatar.cc/96?img=47', badge: '小说区常驻', score: 1030, summary: '贡献 54 条高赞回复' },
  { id: 4, name: '一木', avatar: 'https://i.pravatar.cc/96?img=49', badge: '动画区版主', score: 980, summary: '整理 3 个集中讨论帖' },
  { id: 5, name: '澪', avatar: 'https://i.pravatar.cc/96?img=52', badge: '新人观察员', score: 860, summary: '本周新增 18 个收藏' },
]

const now = Date.now()
const hour = 60 * 60 * 1000

const threads: ThreadRecord[] = [
  {
    id: 101,
    boardKey: 'anime',
    title: '四月新番里最值得追更的三部作品，大家目前最看好哪一部？',
    excerpt: '从第一集演出到原作改编节奏都很稳，目前讨论热度最高的还是两部校园向作品，但这季真正的黑马可能是那部开局不太起眼的群像剧。',
    authorName: '白露',
    createdAt: now - 18 * 60 * 1000,
    views: 1480,
    likes: 86,
    favorites: 29,
    liked: false,
    favorited: false,
    tags: ['新番', '追更', '安利'],
    pinned: true,
    bodyHtml: buildSeedHtml([
      '从目前的开局来看，这季的讨论焦点已经很清楚了，但真正能稳住到中后段的作品还需要继续观察。',
      '我比较想聊的是“第一眼并不炸，但越看越稳”的那种片子，它们通常更容易在中后期逆袭。',
      '欢迎大家直接给出前三名，也可以说说你为什么觉得某一部会掉队。',
    ]),
  },
  {
    id: 102,
    boardKey: 'novel',
    title: '这本恋爱轻小说的后半段节奏突然提速，你们觉得是优点还是缺点？',
    excerpt: '前四卷都是日常铺陈，第五卷开始连续推进主线，有人觉得终于进入正题，也有人觉得失去了前面慢热铺垫的味道。',
    authorName: '纸鸢',
    createdAt: now - 42 * 60 * 1000,
    views: 2330,
    likes: 74,
    favorites: 35,
    liked: false,
    favorited: false,
    tags: ['轻小说', '剧情节奏'],
    featured: true,
    bodyHtml: buildSeedHtml([
      '我自己并不反对提速，问题是它的情绪回收和人物过渡有没有跟上。',
      '如果前面的慢热是为了后面的爆发，那爆发就应该让读者觉得值得。',
      '现在我更好奇的是，大家会不会因为这个转折去重新评价前四卷。',
    ]),
  },
  {
    id: 103,
    boardKey: 'website',
    title: '社区首页原型第一版开放讨论，欢迎集中反馈排版、阅读密度和功能优先级',
    excerpt: '这次会先把 PC 社区首页做成内容优先的结构，移动端后续单独适配。希望大家重点聊三个问题：左侧板块是否清晰、中间帖子流是否顺手、右侧榜单是否有用。',
    authorName: '站务娘',
    createdAt: now - 1 * hour,
    views: 890,
    likes: 61,
    favorites: 18,
    liked: false,
    favorited: false,
    tags: ['公告', '收集反馈'],
    pinned: true,
    locked: true,
    bodyHtml: buildSeedHtml([
      '这条帖子集中收集社区首页第一轮反馈，方便后续统一梳理和排期。',
      '请优先反馈阅读路径、信息密度、以及你觉得最先需要补齐的交互。',
      '和主题无关的内容会在后续整理时被忽略，感谢配合。',
    ]),
  },
  {
    id: 104,
    boardKey: 'game',
    title: '最近有哪些剧情体验很强但讨论度还不够高的日式游戏？',
    excerpt: '不是单纯推荐大作，更想找一些剧情完整、角色塑造足、玩完会想写长评的作品，平台不限。',
    authorName: '七海',
    createdAt: now - 2 * hour,
    views: 1024,
    likes: 57,
    favorites: 24,
    liked: false,
    favorited: false,
    tags: ['剧情向', '求推荐'],
    bodyHtml: buildSeedHtml([
      '我这次不太想补传统热门名单，更想找那种剧情完成度高、但讨论没有大面积发酵的作品。',
      '平台不限，老作品也可以，只要现在回头看仍然有聊头。',
    ]),
  },
  {
    id: 105,
    boardKey: 'comic',
    title: '这部作品的分镜看着平静，但情绪推进非常狠，适合做一次完整拆解',
    excerpt: '很多人第一次看会觉得对白不多、节奏不快，但它在跨页、留白和角色视线的处理上非常成熟，越回味越能看到设计。',
    authorName: '折木',
    createdAt: now - 3 * hour,
    views: 760,
    likes: 49,
    favorites: 21,
    liked: false,
    favorited: false,
    tags: ['分镜', '长评'],
    featured: true,
    bodyHtml: buildSeedHtml([
      '这部漫画最厉害的地方不是“大事件”，而是它如何用极少的动作把情绪压出来。',
      '如果有人愿意一起拆页，我觉得能做成很完整的一篇读后分析。',
    ]),
  },
  {
    id: 106,
    boardKey: 'novel',
    title: '如果社区增加书单共读功能，你最希望它先解决哪种阅读体验问题？',
    excerpt: '我个人最想要的是按章节串联讨论，其次是书单里能直接看到更新节奏和已读进度，这样跟读体验会比现在顺很多。',
    authorName: '花镜',
    createdAt: now - 6 * hour,
    views: 1210,
    likes: 54,
    favorites: 19,
    liked: false,
    favorited: false,
    tags: ['产品建议', '共读'],
    bodyHtml: buildSeedHtml([
      '现在的书单更像整理工具，还不是讨论工具。',
      '如果社区真的做共读，我觉得第一优先级应该是把讨论和阅读进度绑定起来。',
      '大家也可以直接说你最在意的是哪里卡住了。',
    ]),
  },
  {
    id: 107,
    boardKey: 'anime',
    title: '这条标题故意做得很长，用来验证社区首页帖子流在桌面端的两行截断和信息层级是否稳定且仍然保持阅读舒适度',
    excerpt: '长标题场景下，帖子摘要应该自然退到第二层，不应该把回复数和板块标签挤压到难以扫描的位置。',
    authorName: '小春',
    createdAt: now - 9 * hour,
    views: 540,
    likes: 33,
    favorites: 8,
    liked: false,
    favorited: false,
    tags: ['布局测试', '长标题'],
    bodyHtml: buildSeedHtml([
      '这条是纯测试用帖子，主要看列表、详情和相关推荐里的排版是否稳定。',
      '如果你发现某处的标题截断或信息层级有问题，可以直接指出来。',
    ]),
  },
  {
    id: 108,
    boardKey: 'game',
    title: 'Galgame 里最打动你的告白场景是哪一段？',
    excerpt: '不限经典还是新作，只要是你现在还能复述出镜头和配乐的那一段都算。欢迎带原因，不必担心剧透格式，我来整理。',
    authorName: '流火',
    createdAt: now - 28 * hour,
    views: 3044,
    likes: 97,
    favorites: 40,
    liked: false,
    favorited: false,
    tags: ['Galgame', '名场面'],
    bodyHtml: buildSeedHtml([
      '我自己最记得住的，通常不是台词最响亮的那种，而是镜头、停顿、BGM 和角色状态一起到位的场面。',
      '如果你愿意带一点上下文，会更方便后面整理成推荐帖。',
    ]),
  },
  {
    id: 109,
    boardKey: 'comic',
    title: '有没有那种每次更新都想暂停几分钟回味结尾页面的连载？',
    excerpt: '想找一些结尾页调度特别强的作品，不一定要神作，只要每次都能把情绪收得很准就行。',
    authorName: '荷叶',
    createdAt: now - 31 * hour,
    views: 980,
    likes: 44,
    favorites: 11,
    liked: false,
    favorited: false,
    tags: ['追更', '求安利'],
    bodyHtml: buildSeedHtml([
      '我最近想补一些结尾页处理特别稳的连载。',
      '不一定要大热，只要你每次看完最后一页都会停下来消化一下，就很值得推荐。',
    ]),
  },
  {
    id: 110,
    boardKey: 'website',
    title: '反馈收集：你最希望右侧榜单新增什么信息维度？',
    excerpt: '我们正在评估“本周涨幅”“新晋活跃用户”和“版主推荐”这几类榜单形态，欢迎只选一个最有价值的方向。',
    authorName: '管理员',
    createdAt: now - 35 * hour,
    views: 412,
    likes: 28,
    favorites: 6,
    liked: false,
    favorited: false,
    tags: ['站务', '调研'],
    bodyHtml: buildSeedHtml([
      '右侧栏的榜单数量不会做很多，所以信息维度必须非常克制。',
      '这条帖子主要想看，用户真正会用来扫一眼的榜单到底是哪一类。',
    ]),
  },
]

const repliesByThread = new Map<number, ReplyRecord[]>([
  [
    101,
    [
      {
        id: 1001,
        threadId: 101,
        authorName: '空白页',
        authorBadge: '动画区常驻',
        createdAt: now - 8 * 60 * 1000,
        content: '我会先押那部群像剧，第一集信息量很大，但镜头组织非常稳。',
        likes: 24,
        liked: false,
      },
      {
        id: 1002,
        threadId: 101,
        authorName: '微光',
        authorBadge: '追番达人',
        createdAt: now - 4 * 60 * 1000,
        content: '校园向那两部观感更好入口，但黑马相其实已经有了。',
        likes: 12,
        liked: false,
      },
      {
        id: 1003,
        threadId: 101,
        authorName: '晚汐',
        createdAt: now - 3 * 60 * 1000,
        content: '我在等第三集之后再下结论，现在还在观察脚本能不能稳住。',
        likes: 7,
        liked: false,
        parentId: 1001,
        replyToId: 1001,
      },
      {
        id: 1004,
        threadId: 101,
        authorName: '青栀',
        createdAt: now - 150 * 1000,
        content: '群像剧如果第三集还能维持这个密度，我觉得讨论度会继续往上走。',
        likes: 4,
        liked: false,
        parentId: 1001,
        replyToId: 1001,
      },
      {
        id: 1005,
        threadId: 101,
        authorName: '纸灯',
        createdAt: now - 120 * 1000,
        content: '我反而担心它后面收束不住，第一集铺得太开了。',
        likes: 3,
        liked: false,
        parentId: 1001,
        replyToId: 1003,
      },
      {
        id: 1006,
        threadId: 101,
        authorName: '夜见',
        createdAt: now - 90 * 1000,
        content: '是的，决定上限的还是中段调度，不只是开局气质。',
        likes: 2,
        liked: false,
        parentId: 1001,
        replyToId: 1004,
      },
    ],
  ],
  [
    102,
    [
      {
        id: 2001,
        threadId: 102,
        authorName: '折返线',
        authorBadge: '小说区常驻',
        createdAt: now - 15 * 60 * 1000,
        content: '我更喜欢后半段提速，不然前面的关系推进会显得太松。',
        likes: 19,
        liked: false,
      },
      {
        id: 2002,
        threadId: 102,
        authorName: '白川',
        createdAt: now - 6 * 60 * 1000,
        content: '问题不是提速，而是情绪回收不够细，所以会觉得断层。',
        likes: 9,
        liked: false,
      },
      {
        id: 2003,
        threadId: 102,
        authorName: '久留',
        createdAt: now - 5 * 60 * 1000,
        content: '我同意“情绪回收”这个说法，转折其实可以接受，但落点有点急。',
        likes: 5,
        liked: false,
        parentId: 2002,
        replyToId: 2002,
      },
      {
        id: 2004,
        threadId: 102,
        authorName: '栖川',
        createdAt: now - 4 * 60 * 1000,
        content: '我觉得第五卷的问题就是信息推进太快，情绪停顿不够。',
        likes: 6,
        liked: false,
        parentId: 2002,
        replyToId: 2002,
      },
      {
        id: 2005,
        threadId: 102,
        authorName: '墨青',
        createdAt: now - 2 * 60 * 1000,
        content: '如果第六卷能补回人物视角，前面的断层感可能会弱很多。',
        likes: 2,
        liked: false,
        parentId: 2002,
        replyToId: 2004,
      },
    ],
  ],
])

let threadIdSeed = 10000
let replyIdSeed = 50000

const HOME_PAGE_SIZE = 6
const REPLY_PAGE_SIZE = 5
const CHILD_REPLY_PAGE_SIZE = 3

function buildSeedHtml(paragraphs: string[]) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBoard(boardKey: BoardRecordKey) {
  return boardRecords.find((board) => board.key === boardKey)
}

function normalizeBoardKey(boardKey?: CommunityBoardKey): CommunityBoardKey {
  return boardKey && ['all', ...boardRecords.map((board) => board.key)].includes(boardKey) ? boardKey : 'all'
}

function relativeTime(date: number) {
  const delta = Date.now() - date
  if (delta < 60 * 1000) return '刚刚'
  if (delta < hour) return `${Math.max(1, Math.floor(delta / (60 * 1000)))} 分钟前`
  if (delta < 24 * hour) return `${Math.max(1, Math.floor(delta / hour))} 小时前`
  if (delta < 48 * hour) return '昨天'
  if (delta < 7 * 24 * hour) return `${Math.floor(delta / (24 * hour))} 天前`
  return '上周'
}

function normalizeParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function sanitizeHtmlText(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent ?? ''
  div.remove()
  return text
}

function htmlToParagraphs(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html

  const paragraphs = Array.from(div.querySelectorAll('p, li, blockquote, h1, h2, h3, h4, h5, h6'))
    .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter(Boolean)

  const plainText = sanitizeHtmlText(html).replace(/\s+/g, ' ').trim()
  div.remove()

  if (paragraphs.length) {
    return paragraphs
  }

  return plainText ? normalizeParagraphs(plainText) : []
}

function getThreadReplies(threadId: number) {
  if (!repliesByThread.has(threadId)) {
    repliesByThread.set(threadId, [])
  }
  return repliesByThread.get(threadId) ?? []
}

function computeThreadHeat(thread: ThreadRecord) {
  const replies = getThreadReplies(thread.id).length
  const featuredBoost = thread.featured ? 12 : 0
  const pinnedBoost = thread.pinned ? 16 : 0
  return Math.round(thread.likes * 0.7 + thread.favorites * 1.2 + replies * 1.8 + thread.views * 0.03 + featuredBoost + pinnedBoost)
}

function toPagination(page: number, size: number, total: number): CommunityPagination {
  const totalPages = Math.max(1, Math.ceil(total / size))
  return {
    page,
    size,
    total,
    totalPages,
    hasMore: page < totalPages,
  }
}

function paginate<T>(items: T[], page: number, size: number) {
  const offset = (page - 1) * size
  return items.slice(offset, offset + size)
}

function getAuthorAvatar(seed: string) {
  return `https://i.pravatar.cc/96?u=${encodeURIComponent(`community-${seed}`)}`
}

function toFeedItem(thread: ThreadRecord): CommunityFeedItem {
  const board = getBoard(thread.boardKey)
  return {
    id: thread.id,
    boardKey: thread.boardKey,
    boardName: board?.title ?? '社区',
    title: thread.title,
    excerpt: thread.excerpt,
    authorName: thread.authorName,
    authorAvatar: getAuthorAvatar(`${thread.id}-${thread.authorName}`),
    publishedAt: relativeTime(thread.createdAt),
    replies: getThreadReplies(thread.id).length,
    views: thread.views,
    heat: computeThreadHeat(thread),
    likes: thread.likes,
    favorites: thread.favorites,
    tags: thread.tags,
    featured: thread.featured,
    pinned: thread.pinned,
    locked: thread.locked,
    liked: thread.liked,
    favorited: thread.favorited,
  }
}

function toReplyTarget(replyToId?: number): CommunityReplyTarget | undefined {
  if (!replyToId) {
    return undefined
  }

  const reply = Array.from(repliesByThread.values())
    .flat()
    .find((item) => item.id === replyToId)

  if (!reply) {
    return undefined
  }

  return {
    id: reply.id,
    authorName: reply.authorName,
  }
}

function toReplyItem(reply: ReplyRecord): CommunityThreadReply {
  return {
    id: reply.id,
    authorName: reply.authorName,
    authorBadge: reply.authorBadge,
    authorAvatar: getAuthorAvatar(`${reply.id}-${reply.authorName}`),
    publishedAt: relativeTime(reply.createdAt),
    content: reply.content,
    likes: reply.likes,
    liked: reply.liked,
    replyTo: toReplyTarget(reply.replyToId),
    childReplies: [],
    childPage: toPagination(1, CHILD_REPLY_PAGE_SIZE, 0),
  }
}

function getRootReplies(threadId: number) {
  return getThreadReplies(threadId).filter((item) => !item.parentId)
}

function getChildReplies(threadId: number, parentReplyId: number) {
  return getThreadReplies(threadId).filter((item) => item.parentId === parentReplyId)
}

function toNestedReplyItem(threadId: number, reply: ReplyRecord, childPage = 1, childSize = CHILD_REPLY_PAGE_SIZE) {
  const children = getChildReplies(threadId, reply.id).sort((a, b) => a.createdAt - b.createdAt)
  const mapped = toReplyItem(reply)
  mapped.childReplies = paginate(children, childPage, childSize).map((item) => toReplyItem(item))
  mapped.childPage = toPagination(childPage, childSize, children.length)
  return mapped
}

function resolveReplyRelation(threadId: number, replyToId?: number) {
  if (!replyToId) {
    return { parentId: undefined, replyToId: undefined }
  }

  const target = getThreadReplies(threadId).find((item) => item.id === replyToId)
  if (!target) {
    throw new Error('回复不存在')
  }

  return {
    parentId: target.parentId ?? target.id,
    replyToId: target.id,
  }
}

function filterByScope(items: ThreadRecord[], scope: CommunityFeedScope) {
  if (scope === 'today') {
    return items.filter((item) => Date.now() - item.createdAt < 24 * hour)
  }

  if (scope === 'week') {
    return items.filter((item) => Date.now() - item.createdAt < 7 * 24 * hour)
  }

  return items
}

function sortByOrder(items: ThreadRecord[], order: CommunityFeedOrder) {
  const cloned = [...items]

  if (order === 'hot') {
    return cloned.sort((a, b) => computeThreadHeat(b) - computeThreadHeat(a))
  }

  if (order === 'featured') {
    return cloned.sort((a, b) => {
      const aWeight = Number(a.pinned) * 1000 + Number(a.featured) * 100
      const bWeight = Number(b.pinned) * 1000 + Number(b.featured) * 100
      return bWeight - aWeight || computeThreadHeat(b) - computeThreadHeat(a)
    })
  }

  return cloned.sort((a, b) => {
    const aWeight = Number(a.pinned) * 1000 + Number(a.featured) * 100
    const bWeight = Number(b.pinned) * 1000 + Number(b.featured) * 100
    return bWeight - aWeight || b.createdAt - a.createdAt
  })
}

function buildBoardSummaries(): CommunityBoardSummary[] {
  const allThreads = threads.map(toFeedItem)
  const allTodayPosts = threads.filter((item) => Date.now() - item.createdAt < 24 * hour).length
  const totalHeat = allThreads.reduce((sum, item) => sum + item.heat, 0)

  return [
    {
      id: 0,
      key: 'all',
      title: '全部讨论',
      description: '一眼看到今天最热和最新的社区内容',
      icon: 'mdiForum',
      todayPosts: allTodayPosts,
      heatLabel: `热度 ${(totalHeat / 1000).toFixed(1)}k`,
    },
    ...boardRecords.map((board) => {
      const boardThreads = threads.filter((item) => item.boardKey === board.key)
      const boardHeat = boardThreads.reduce((sum, item) => sum + computeThreadHeat(item), 0)
      return {
        id: board.id,
        key: board.key,
        title: board.title,
        description: board.description,
        icon: board.icon,
        todayPosts: boardThreads.filter((item) => Date.now() - item.createdAt < 24 * hour).length,
        heatLabel: `热度 ${(Math.max(boardHeat, 1) / 1000).toFixed(1)}k`,
      }
    }),
  ]
}

function buildHotThreads(): CommunityHotRankItem[] {
  return threads
    .map(toFeedItem)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id,
      title: item.title,
      boardName: item.boardName,
      heat: item.heat,
      deltaLabel: index < 3 ? '上升中' : '讨论稳定',
    }))
}

function inferTags(boardKey: BoardRecordKey, title: string, paragraphs: string[]) {
  const tags: string[] = []
  const plain = `${title} ${paragraphs.join(' ')}`.toLowerCase()
  const boardTitle = getBoard(boardKey)?.title

  if (boardTitle) tags.push(boardTitle)
  if (/[？?]|为什么|如何|怎么|求/.test(title)) tags.push('提问')
  if (/安利|推荐|入坑|补番/.test(plain)) tags.push('安利')
  if (/分析|复盘|长评|拆解|评价/.test(plain)) tags.push('长评')
  if (boardKey === 'anime' && /新番|作画|追更/.test(plain)) tags.push('新番')
  if (boardKey === 'comic' && /分镜|连载/.test(plain)) tags.push('分镜')
  if (boardKey === 'game' && /剧情|gal|jrpg/.test(plain)) tags.push('剧情向')
  if (boardKey === 'novel' && /轻小说|章节|共读/.test(plain)) tags.push('轻小说')
  if (boardKey === 'website' && /反馈|建议|功能/.test(plain)) tags.push('站务')

  return [...new Set(tags)].slice(0, 4)
}

function buildExcerpt(title: string, bodyHtml: string) {
  const text = sanitizeHtmlText(bodyHtml).replace(/\s+/g, ' ').trim()
  return (text || title).slice(0, 120)
}

export async function getCommunityHome(query: CommunityListQuery = {}): Promise<CommunityHomePayload> {
  const boardKey = normalizeBoardKey(query.boardKey)
  const order = query.order ?? 'latest'
  const scope = query.scope ?? 'all'
  const page = Math.max(1, query.page ?? 1)
  const size = Math.max(1, query.size ?? HOME_PAGE_SIZE)

  const boardFiltered = boardKey === 'all' ? threads : threads.filter((item) => item.boardKey === boardKey)
  const filtered = sortByOrder(filterByScope(boardFiltered, scope), order)
  const paged = paginate(filtered, page, size)

  await sleep(140)

  return {
    title: '社区讨论中心',
    subtitle: '围绕动画、漫画、游戏、小说和站内话题展开更轻量的交流。',
    announcement: '社区首页原型已开放，欢迎从“站务”板块集中反馈体验问题。',
    announcementLink: '/forum/list?board=website',
    todayThreads: threads.filter((item) => Date.now() - item.createdAt < 24 * hour).length,
    onlineUsers: 286,
    boards: buildBoardSummaries(),
    feed: paged.map(toFeedItem),
    feedPage: toPagination(page, size, filtered.length),
    hotThreads: buildHotThreads(),
    activeUsers,
  }
}

export async function getCommunityThread(
  id: number,
  replyPage = 1,
  replySize = REPLY_PAGE_SIZE,
  options: { trackView?: boolean } = {},
): Promise<CommunityThreadDetail | null> {
  const thread = threads.find((item) => item.id === id)
  if (!thread) {
    await sleep(80)
    return null
  }

  if (options.trackView ?? replyPage === 1) {
    thread.views += 1
  }
  const rootReplies = [...getRootReplies(id)].sort((a, b) => b.createdAt - a.createdAt)
  const pagedReplies = paginate(rootReplies, replyPage, replySize)
  const paragraphs = htmlToParagraphs(thread.bodyHtml)

  await sleep(100)

  return {
    ...toFeedItem(thread),
    body: paragraphs,
    bodyHtml: thread.bodyHtml,
    replyItems: pagedReplies.map((item) => toNestedReplyItem(id, item)),
    repliesPage: toPagination(replyPage, replySize, rootReplies.length),
    relatedThreads: sortByOrder(
      threads.filter((item) => item.id !== id && item.boardKey === thread.boardKey),
      'hot',
    )
      .slice(0, 3)
      .map(toFeedItem),
  }
}

export async function createCommunityThread(req: CreateCommunityThreadRequest): Promise<CommunityThreadDetail> {
  const paragraphs = htmlToParagraphs(req.contentHtml)
  const created: ThreadRecord = {
    id: threadIdSeed++,
    boardKey: req.boardKey,
    title: req.title.trim(),
    excerpt: buildExcerpt(req.title, req.contentHtml),
    authorName: req.authorName,
    createdAt: Date.now(),
    views: 1,
    likes: 0,
    favorites: 0,
    liked: false,
    favorited: false,
    tags: inferTags(req.boardKey, req.title, paragraphs),
    bodyHtml: req.contentHtml,
  }

  threads.unshift(created)
  repliesByThread.set(created.id, [])
  await sleep(120)

  return {
    ...toFeedItem(created),
    body: paragraphs,
    bodyHtml: created.bodyHtml,
    replyItems: [],
    repliesPage: toPagination(1, REPLY_PAGE_SIZE, 0),
    relatedThreads: [],
  }
}

export async function createCommunityReply(req: CreateCommunityReplyRequest): Promise<CommunityThreadReply> {
  const thread = threads.find((item) => item.id === req.threadId)
  if (!thread) {
    throw new Error('帖子不存在')
  }

  if (thread.locked) {
    throw new Error('当前帖子已锁定')
  }

  const relation = resolveReplyRelation(req.threadId, req.replyToId)

  const nextReply: ReplyRecord = {
    id: replyIdSeed++,
    threadId: req.threadId,
    authorName: req.authorName,
    authorBadge: req.replyToId ? '刚刚回应' : '刚刚参与',
    createdAt: Date.now(),
    content: req.content.trim(),
    likes: 0,
    liked: false,
    parentId: relation.parentId,
    replyToId: relation.replyToId,
  }

  getThreadReplies(req.threadId).unshift(nextReply)
  await sleep(100)
  return toNestedReplyItem(req.threadId, nextReply)
}

export async function toggleThreadLike(id: number) {
  const thread = threads.find((item) => item.id === id)
  if (!thread) {
    throw new Error('帖子不存在')
  }

  thread.liked = !thread.liked
  thread.likes += thread.liked ? 1 : -1
  await sleep(60)

  return {
    liked: thread.liked,
    likes: thread.likes,
  }
}

export async function toggleThreadFavorite(id: number) {
  const thread = threads.find((item) => item.id === id)
  if (!thread) {
    throw new Error('帖子不存在')
  }

  thread.favorited = !thread.favorited
  thread.favorites += thread.favorited ? 1 : -1
  await sleep(60)

  return {
    favorited: thread.favorited,
    favorites: thread.favorites,
  }
}

export async function toggleReplyLike(threadId: number, replyId: number) {
  const reply = getThreadReplies(threadId).find((item) => item.id === replyId)
  if (!reply) {
    throw new Error('回复不存在')
  }

  reply.liked = !reply.liked
  reply.likes += reply.liked ? 1 : -1
  await sleep(60)

  return {
    liked: reply.liked,
    likes: reply.likes,
  }
}

export async function getCommunityReplyChildren(req: GetCommunityReplyChildrenRequest) {
  const thread = threads.find((item) => item.id === req.threadId)
  if (!thread) {
    throw new Error('帖子不存在')
  }

  const page = Math.max(1, req.page ?? 1)
  const size = Math.max(1, req.size ?? CHILD_REPLY_PAGE_SIZE)
  const children = getChildReplies(req.threadId, req.parentReplyId).sort((a, b) => a.createdAt - b.createdAt)

  await sleep(80)

  return {
    items: paginate(children, page, size).map((item) => toReplyItem(item)),
    page: toPagination(page, size, children.length),
  }
}

export async function getMyCommunityOverview(authorName = '你'): Promise<CommunityMyOverview> {
  await sleep(100)

  const publishedThreads = threads
    .filter((item) => item.authorName === authorName)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toFeedItem)

  const participatedReplies = Array.from(repliesByThread.entries())
    .flatMap(([threadId, items]) => {
      const thread = threads.find((entry) => entry.id === threadId)
      if (!thread) {
        return []
      }

      return items
        .filter((reply) => reply.authorName === authorName)
        .map<CommunityMyReplyItem>((reply) => ({
          id: reply.id,
          threadId,
          threadTitle: thread.title,
          boardName: getBoard(thread.boardKey)?.title ?? '社区',
          content: reply.content,
          publishedAt: relativeTime(reply.createdAt),
          likes: reply.likes,
          replyToName: toReplyTarget(reply.replyToId)?.authorName,
        }))
    })
    .sort((a, b) => b.id - a.id)

  const favoriteThreads = threads
    .filter((item) => item.favorited)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toFeedItem)

  return {
    authorName,
    publishedThreads,
    participatedReplies,
    favoriteThreads,
  }
}
