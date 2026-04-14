import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'telegram',
  description: 'Manage the Claudex Telegram gateway',
  load: () => import('./telegram.js'),
} satisfies Command
