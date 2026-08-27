// 构建前清理：删除 lib 下全部生成物，只保留手工同步维护的 Typert 产物
// （官方 generator 绑定 DSH workspace 布局，无法在本插件目录内再生成），
// 并清掉项目根的 tsc 增量缓存，保证"clean 后 tsc -b 一定会重新产出"。
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

// 本脚本位于 <projectRoot>/scripts/，项目根是其上一级。
const root = resolve(import.meta.dirname, '..')
const libDir = join(root, 'lib')

/** Typert 产物白名单：文件名精确匹配，一个都不多留。 */
const KEEP = new Set([
  'typert.host.js',
  'typert.host.d.ts',
  'typert.remote-client.js',
  'typert.remote-client.d.ts',
])

if (existsSync(libDir)) {
  for (const entry of readdirSync(libDir)) {
    if (KEEP.has(entry)) continue
    rmSync(join(libDir, entry), { recursive: true, force: true })
  }
}

for (const cacheFile of ['.tsbuildinfo.host', '.tsbuildinfo.client']) {
  const cachePath = join(root, cacheFile)
  if (existsSync(cachePath)) rmSync(cachePath, { force: true })
}
