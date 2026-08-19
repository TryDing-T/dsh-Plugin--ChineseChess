/** DSH's browser bundle preset keeps the plugin in the module-loader graph. */

import { clientBundle } from '../../DSHarness/packages/client/tsdown.client.ts'

export default clientBundle(
  '@deepseek-ai/dsh-plugin-xiangqi',
  ['lib/types/index.js'],
  { hostPhase: true },
)
