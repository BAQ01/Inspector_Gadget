import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { verifySupabaseClientKey } from './verify-supabase-client-key.mjs'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const assets = await readdir(join(dist, 'assets'))
const bundles = assets.filter((name) => name.endsWith('.js'))

if (bundles.length !== 1) {
  throw new Error(`Verwacht precies één applicatiebundel, gevonden: ${bundles.length}`)
}

const bundle = await readFile(join(dist, 'assets', bundles[0]), 'utf8')
for (const marker of ['Planning en agenda', 'Werkvoorraad', 'Commerciële pipeline', 'Mailtaken', 'Taken uit de B2Inspect-mailbox', 'Kilometerdeclaraties', 'Excel inladen', 'Excel downloaden']) {
  if (!bundle.includes(marker)) throw new Error(`Kernfunctie ontbreekt in bronbuild: ${marker}`)
}

verifySupabaseClientKey(bundle, 'Bronbuild')

const index = await readFile(join(dist, 'index.html'), 'utf8')
if (!index.includes(`assets/${bundles[0]}`)) {
  throw new Error('index.html verwijst niet naar de gecontroleerde applicatiebundel')
}

console.log(`Gereconstrueerde bronbuild geldig: ${bundles[0]}, kernfuncties aanwezig.`)
