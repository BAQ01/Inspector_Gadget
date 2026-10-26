import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const assets = await readdir(join(dist, 'assets'))
const bundles = assets.filter((name) => name.endsWith('.js'))

if (bundles.length !== 1) {
  throw new Error(`Verwacht precies één applicatiebundel, gevonden: ${bundles.length}`)
}

const bundle = await readFile(join(dist, 'assets', bundles[0]), 'utf8')
for (const marker of ['Planning en agenda', 'Werkvoorraad', 'Commerciële pipeline']) {
  if (!bundle.includes(marker)) throw new Error(`Kernfunctie ontbreekt in bronbuild: ${marker}`)
}

if ((bundle.match(/sb_publishable_/g) ?? []).length !== 1) {
  throw new Error('Bronbuild moet precies één Supabase publishable sleutel bevatten')
}
if (bundle.includes('sb_secret_') || bundle.includes('service_role')) {
  throw new Error('Geheime Supabase-sleutel aangetroffen in clientbundel')
}

const index = await readFile(join(dist, 'index.html'), 'utf8')
if (!index.includes(`assets/${bundles[0]}`)) {
  throw new Error('index.html verwijst niet naar de gecontroleerde applicatiebundel')
}

console.log(`Gereconstrueerde bronbuild geldig: ${bundles[0]}, kernfuncties aanwezig.`)
