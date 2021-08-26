import { create } from 'naive-ui'
import * as components from './export'

export const naive = create({
  components: Object.values(components)
})
