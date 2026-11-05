import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const workspaceSource = await readFile(new URL('../src/runtime/admin-workspaces.ts', import.meta.url), 'utf8')
const quoteCss = await readFile(new URL('../src/quote.css', import.meta.url), 'utf8')

test('offerte-pdf gebruikt de B2Inspect-indeling van het goedgekeurde voorbeeld', () => {
  assert.match(workspaceSource, /function QuoteBrand\(\)/)
  assert.match(workspaceSource, /children: "Uw inspectievraag"/)
  assert.match(workspaceSource, /children: "Dit voeren wij voor u uit"/)
  assert.match(workspaceSource, /children: "Uw investering"/)
  assert.match(workspaceSource, /backgroundColor: ds\.navy/)
  assert.match(workspaceSource, /leftLabel: "Offertenummer"/)
})

test('offertetool toont aanpasbare prijsregels met herstel naar automatisch', () => {
  assert.match(workspaceSource, /function QuotePriceField\(/)
  assert.match(workspaceSource, /children: "Prijsregels"/)
  assert.match(workspaceSource, /children: "Herstel automatisch"/)
  assert.match(workspaceSource, /manualLaborCost/)
  assert.match(workspaceSource, /manualOtherCost/)
  assert.match(quoteCss, /\.ig-quote-price-field\.is-manual/)
  assert.match(quoteCss, /@media \(max-width: 520px\)/)
})
