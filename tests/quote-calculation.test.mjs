import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateQuote,
  createDefaultQuoteInput,
  normalizeQuoteInput,
  validateQuoteInput,
} from '../src/runtime/quote-calculation.js'

test('bestaande offertes blijven bruikbaar en krijgen automatische prijsregels', () => {
  const normalized = normalizeQuoteInput({
    scope: '8',
    surfaceArea: 750,
    hourlyRate: 105,
  }, ['8'])

  assert.equal(normalized.schemaVersion, 2)
  assert.equal(normalized.scope, '8')
  assert.equal(normalized.surfaceArea, 750)
  assert.equal(normalized.manualLaborCost, null)
  assert.equal(normalized.manualTravelCost, null)
  assert.equal(validateQuoteInput(normalized), null)
})

test('handmatige prijsregels bepalen het totaal en de btw', () => {
  const input = {
    ...createDefaultQuoteInput(['8', '10']),
    manualLaborCost: 1000,
    manualTravelCost: 125,
    manualSciosCost: 60,
    manualEquipmentCost: 200,
    manualOtherCost: 75,
  }
  const quote = calculateQuote(input)

  assert.equal(quote.laborCost, 1000)
  assert.equal(quote.travelCost, 125)
  assert.equal(quote.sciosCost, 60)
  assert.equal(quote.equipmentCost, 200)
  assert.equal(quote.otherCost, 75)
  assert.equal(quote.totalExcludingVat, 1460)
  assert.equal(quote.vat, 306.6)
  assert.equal(quote.totalIncludingVat, 1766.6)
})

test('nul is een geldige handmatige prijs en null herstelt automatisch rekenen', () => {
  const defaultInput = createDefaultQuoteInput(['10'])
  const automatic = calculateQuote(defaultInput)
  const freeTravel = calculateQuote({ ...defaultInput, manualTravelCost: 0 })
  const restored = calculateQuote({ ...defaultInput, manualTravelCost: null })

  assert.equal(freeTravel.travelCost, 0)
  assert.ok(automatic.travelCost > 0)
  assert.equal(restored.travelCost, automatic.travelCost)
})

test('ongeldige handmatige bedragen worden geblokkeerd', () => {
  const input = { ...createDefaultQuoteInput(), manualLaborCost: -1 }
  assert.match(validateQuoteInput(input), /Handmatige inspectieprijs/)
})
