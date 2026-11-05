import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/runtime/admin-workspaces.ts', import.meta.url), 'utf8')
const functionStart = source.indexOf('function calculateQuote')
const functionEnd = source.indexOf('function createQuotePdfFilename')

assert.notEqual(functionStart, -1, 'calculateQuote ontbreekt')
assert.notEqual(functionEnd, -1, 'einde van calculateQuote ontbreekt')

const calculateQuote = Function(
  'nje',
  'aje',
  'lU',
  'Qm',
  `${source.slice(functionStart, functionEnd)}; return calculateQuote;`
)(
  2,
  { kantoor: .0016, industrie: .005, agrarisch: .006, zorg: .003, onderwijs: .0025, horeca: .0045, logistiek: .0022 },
  35,
  value => Math.round((value + Number.EPSILON) * 100) / 100
)

const baseInput = {
  scope: '10',
  inspectionType: 'PI',
  riskClass: 'B',
  buildingType: 'kantoor',
  buildingAge: 'normaal',
  accessibility: 'goed',
  documentation: 'compleet',
  surfaceArea: 500,
  mainBoards: 1,
  subBoards: 0,
  hasSolar: false,
  solarInverters: 0,
  hasEV: false,
  evChargers: 0,
  heavyMachinery: 0,
  hasUPS: false,
  travelDistance: 50,
  outOfHours: false,
  needsLift: false,
  safetyInduction: false,
  inspectionHours: null,
  hourlyRate: 95,
  travelHourlyRate: 95,
  travelKilometerRate: .45,
  unforeseenCosts: 0,
  hotelCosts: 0,
  parkingCosts: 0,
  customTotalExcludingVat: null
}

test('automatische offerte gebruikt afzonderlijke reis- en inspectietarieven', () => {
  const result = calculateQuote({
    ...baseInput,
    inspectionHours: 10,
    hourlyRate: 120,
    travelHourlyRate: 60,
    travelKilometerRate: .3
  })

  assert.equal(result.hours, 10)
  assert.equal(result.laborCost, 1200)
  assert.equal(result.travelHours, 1.25)
  assert.equal(result.travelCost, 105)
  assert.equal(result.totalExcludingVat, 1340)
})

test('handmatig eindbedrag bepaalt opslag, btw, pdf-bedrag en dossierbedrag', () => {
  const result = calculateQuote({
    ...baseInput,
    inspectionHours: 12,
    hourlyRate: 120,
    travelHourlyRate: 60,
    travelKilometerRate: .3,
    customTotalExcludingVat: 2500
  })

  assert.equal(result.calculatedTotalExcludingVat, 1580)
  assert.equal(result.manualAdjustment, 920)
  assert.equal(result.totalExcludingVat, 2500)
  assert.equal(result.vat, 525)
  assert.equal(result.totalIncludingVat, 3025)
})

test('lege handmatige velden behouden de automatische berekening', () => {
  const result = calculateQuote(baseInput)

  assert.equal(result.hours, result.automaticHours)
  assert.equal(result.manualAdjustment, 0)
  assert.equal(result.totalExcludingVat, result.calculatedTotalExcludingVat)
})
