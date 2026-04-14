import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'telegram',
  description: 'Manage the Cluadex Telegram gateway',
  load: () => import('./telegram.js'),
} satisfies Command
