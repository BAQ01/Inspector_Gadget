import { cp, mkdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

await import('./verify-production-snapshot.mjs')

const root = resolve(import.meta.dirname, '..')
const snapshot = join(root, 'production-snapshot')
const dist = join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(snapshot, dist, { recursive: true, filter: (source) => !source.endsWith('SHA256SUMS') })
console.log('Werkende productie-snapshot staat klaar in dist/.')
