import { requestWithSignalr } from '@/services/internal/request'
import { Card } from '@/types/collaborator'

/** 获取贡献者列表 */
export function getCollaboratorList() {
  return requestWithSignalr<Card[]>('GetCollaboratorList')
}
