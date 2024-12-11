import { defineStore } from 'pinia'
import { collaborators } from './data'

/** 贡献列表store */
export const useCollaborators = defineStore('page.collaborator', {
  state() {
    return { collaborators }
  },
})
