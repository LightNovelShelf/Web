import { Card } from '@/types/collaborator'
import { defineStore } from 'pinia'

interface State {
  collaborators: Card[]
}

const STATE: State = {
  collaborators: []
}

export const useCollaborators = defineStore('page.collaborator', {
  state() {
    return STATE
  }
})
