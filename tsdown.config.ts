/** DSH's browser bundle preset keeps the plugin in the module-loader graph. */

import { isBuiltin } from 'node:module'
import { clientBundle } from '../_DSHarness-latest-rc2/packages/client/tsdown.client.ts'

export default clientBundle(
  '@deepseek-ai/dsh-plugin-xiangqi',
  ['lib/types/index.js'],
  {
    hostPhase: true,
    lib: {
      deps: {
        neverBundle: (specifier) => specifier.startsWith('@deepseek-ai/'),
        alwaysBundle: (specifier) => !isBuiltin(specifier) && !specifier.startsWith('@deepseek-ai/'),
      },
    },
  },
)
