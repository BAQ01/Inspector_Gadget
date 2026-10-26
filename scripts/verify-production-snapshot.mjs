import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const snapshot = join(root, 'production-snapshot')

const checksumText = await readFile(join(snapshot, 'SHA256SUMS'), 'utf8')
const expected = new Map(
  checksumText.trim().split('\n').map((line) => {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/)
    if (!match) throw new Error(`Ongeldige checksumregel: ${line}`)
    return [match[2].replace(/^\.\//, ''), match[1]]
  }),
)

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await filesBelow(full))
    else if (entry.name !== 'SHA256SUMS') files.push(full)
  }
  return files
}

const files = await filesBelow(snapshot)
const actualNames = files.map((file) => relative(snapshot, file)).sort()
const expectedNames = [...expected.keys()].sort()
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  throw new Error('Bestandslijst van productie-snapshot wijkt af van SHA256SUMS')
}

for (const file of files) {
  const name = relative(snapshot, file)
  const digest = createHash('sha256').update(await readFile(file)).digest('hex')
  if (digest !== expected.get(name)) throw new Error(`Checksum wijkt af: ${name}`)
}

const assets = actualNames.filter((name) => /^assets\/.*\.js$/.test(name))
if (assets.length !== 1) throw new Error(`Verwacht precies één JavaScript-bundel, gevonden: ${assets.length}`)

const bundle = await readFile(join(snapshot, assets[0]), 'utf8')
for (const marker of ['Planning en agenda', 'Werkvoorraad', 'Commerciële pipeline']) {
  if (!bundle.includes(marker)) throw new Error(`Kernfunctie ontbreekt in productie-bundel: ${marker}`)
}
if ((bundle.match(/sb_publishable_/g) ?? []).length !== 1) {
  throw new Error('Productiebundel moet precies één Supabase publishable sleutel bevatten')
}
if (bundle.includes('sb_secret_') || bundle.includes('service_role')) {
  throw new Error('Geheime Supabase-sleutel aangetroffen in clientbundel')
}

const index = await readFile(join(snapshot, 'index.html'), 'utf8')
if (!index.includes(assets[0])) {
  throw new Error('index.html verwijst niet naar de gecontroleerde JavaScript-bundel')
}

console.log(`Productie-snapshot geldig: ${files.length} bestanden, kernfuncties aanwezig.`)
