import type { Command, LocalJSXCommandModule } from '../../commands.js'
import { isPolicyAllowed } from '../../services/policyLimits/index.js'
import { isClaudeAISubscriber } from '../../utils/auth.js'

export default {
  type: 'local-jsx',
  name: 'remote-env',
  description: 'Configure the default remote environment for teleport sessions',
  isEnabled: () =>
    isClaudeAISubscriber() && isPolicyAllowed('allow_remote_sessions'),
  get isHidden() {
    return !isClaudeAISubscriber() || !isPolicyAllowed('allow_remote_sessions')
  },
  // Feature disabled - remote-env.tsx does not exist
  load: () => Promise.resolve({ call: () => Promise.resolve(null) } as unknown as LocalJSXCommandModule),
} satisfies Command
