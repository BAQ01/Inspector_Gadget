import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const tabletCss = await readFile(new URL('../src/tablet.css', import.meta.url), 'utf8')
const workspaceSource = await readFile(new URL('../src/runtime/inspector-workspaces.ts', import.meta.url), 'utf8')

test('mobiele stappenbalk geeft de track de volledige breedte', () => {
  assert.match(tabletCss, /\.ig-step-nav\s*\{[^}]*display:\s*block\s*!important;[^}]*overflow-x:\s*auto\s*!important;/s)
  assert.match(tabletCss, /\.ig-step-track\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);[^}]*width:\s*100%\s*!important;/s)
  assert.match(tabletCss, /\.ig-step-item\s*\{[^}]*min-width:\s*0\s*!important;[^}]*white-space:\s*normal\s*!important;/s)
})

test('zeer smalle schermen gebruiken gecontroleerd horizontaal scrollen', () => {
  assert.match(tabletCss, /@media \(max-width:\s*359px\)[\s\S]*?\.ig-step-track\s*\{[^}]*min-width:\s*20rem\s*!important;/)
  assert.match(tabletCss, /scroll-snap-type:\s*x proximity;/)
})

test('stappen en foto-acties blijven begrijpelijk en toegankelijk', () => {
  assert.match(workspaceSource, /stepLabel = ie === "setup" \? "Basis"[\s\S]*?: "Rapport";/)
  assert.match(workspaceSource, /"aria-label": `Stap \$\{Se \+ 1\}: \$\{stepLabel\}`/)
  assert.match(workspaceSource, /htmlFor: "defect-photo-1"[\s\S]*?id: "defect-photo-1"[\s\S]*?"aria-label": "Foto 1 van het gebrek uploaden"/)
  assert.match(workspaceSource, /htmlFor: "defect-photo-2"[\s\S]*?id: "defect-photo-2"[\s\S]*?"aria-label": "Foto 2 van het gebrek uploaden"/)
})

