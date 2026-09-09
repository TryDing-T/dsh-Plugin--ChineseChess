// The official analyzer discovers packages under a workspace's packages/ tree.
// Stage this standalone package there without requiring a DSH source checkout.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const workspace = mkdtempSync(join(tmpdir(), 'dsh-xiangqi-typert-'))
const packageRoot = join(workspace, 'packages', 'xiangqi')
const modules = join(workspace, 'node_modules')
let linked = false
try {
  mkdirSync(packageRoot, { recursive: true })
  for (const file of ['src', 'package.json', 'tsconfig.host.json', 'tsconfig.client.json', 'tsconfig.json']) {
    cpSync(join(root, file), join(packageRoot, file), { recursive: true })
  }
  symlinkSync(join(root, 'node_modules'), modules, process.platform === 'win32' ? 'junction' : 'dir')
  linked = true
  // Register published lookup/protocol declarations with their package identity.
  // The analyzer expects their declaration graph under src/, so stage the exact
  // npm declarations there; no dependency implementation or codec is rewritten.
  const require = createRequire(join(root, 'package.json'))
  const references = [{ path: './packages/xiangqi/tsconfig.host.json' }]
  const paths = {}
  for (const name of ['dsh-typert-protocol', 'dsh-session', 'dsh-agent', 'dsh-brand', 'dsh-api-session-controller', 'dsh-session-projection']) {
    const specifier = `@deepseek-ai/${name}`
    const dependencyRequire = name === 'dsh-brand' ? createRequire(require.resolve('@deepseek-ai/dsh-session/package.json')) : require
    const sourceRoot = dirname(dependencyRequire.resolve(`${specifier}/package.json`))
    const dependencyRoot = join(workspace, 'packages', name)
    cpSync(join(sourceRoot, 'package.json'), join(dependencyRoot, 'package.json'), { recursive: true })
    for (const file of readdirSync(join(sourceRoot, 'lib', 'types'), { recursive: true })) {
      if (!file.endsWith('.d.ts')) continue
      const target = join(dependencyRoot, 'src', file.replace(/\.d\.ts$/, '.ts'))
      mkdirSync(dirname(target), { recursive: true })
      cpSync(join(sourceRoot, 'lib', 'types', file), target)
    }
    const dependency = JSON.parse(readFileSync(join(sourceRoot, 'package.json'), 'utf8'))
    for (const [subpath, entry] of Object.entries(dependency.exports)) {
      if (typeof entry !== 'object' || typeof entry.types !== 'string' || !entry.types.startsWith('./lib/types/')) continue
      const file = entry.types.slice('./lib/types/'.length).replace(/\.d\.ts$/, '.ts')
      paths[subpath === '.' ? specifier : specifier + subpath.slice(1)] = [`./packages/${name}/src/${file}`]
    }
    writeFileSync(join(dependencyRoot, 'tsconfig.host.json'), JSON.stringify({
      compilerOptions: { skipLibCheck: true }, include: ['src/**/*.ts'],
    }, null, 2))
    references.push({ path: `./packages/${name}/tsconfig.host.json` })
  }
  writeFileSync(join(workspace, 'tsconfig.host.json'), JSON.stringify({
    extends: './packages/xiangqi/tsconfig.host.json',
    files: [],
    include: [],
    compilerOptions: { paths },
    references,
  }, null, 2))
  const artifacts = new WorkspaceTypertGenerator(workspace).generate([manifest.name], ['host'])
  const host = artifacts.find(artifact => artifact.package === manifest.name && artifact.face === 'host')
  if (host?.remote === undefined) throw new Error('Typert did not generate the Xiangqi Host and Remote contributions')
  const output = {
    'typert.host.js': host.js,
    'typert.host.d.ts': host.dts,
    'typert.remote-client.js': host.remote.js,
    'typert.remote-client.d.ts': host.remote.dts,
    'typert.remote-client.d.ts.map': host.remote.dtsMap,
  }
  mkdirSync(join(root, 'lib'), { recursive: true })
  const check = process.argv.includes('--check')
  for (const [file, text] of Object.entries(output)) {
    const target = join(root, 'lib', file)
    if (check) {
      if (readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n')) {
        throw new Error(`${file} is stale; run npm run generate:typert`)
      }
    } else {
      writeFileSync(target, text)
    }
  }
  console.log(`${check ? 'Verified' : 'Generated'} ${Object.keys(output).length} Typert artifacts for ${manifest.name}`)
} finally {
  // Remove only the dependency link, never its target, before removing our temp tree.
  if (linked) unlinkSync(modules)
  rmSync(workspace, { recursive: true, force: true })
}
