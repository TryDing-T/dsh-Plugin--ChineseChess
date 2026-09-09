// Clean all build output, including Typert artifacts, before regeneration.
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

// 本脚本位于 <projectRoot>/scripts/，项目根是其上一级。
const root = resolve(import.meta.dirname, '..')
const libDir = join(root, 'lib')

if (existsSync(libDir)) {
  for (const entry of readdirSync(libDir)) {
    rmSync(join(libDir, entry), { recursive: true, force: true })
  }
}

for (const cacheFile of ['.tsbuildinfo.host', '.tsbuildinfo.client']) {
  const cachePath = join(root, cacheFile)
  if (existsSync(cachePath)) rmSync(cachePath, { force: true })
}
