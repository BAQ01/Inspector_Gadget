import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/runtime/inspection-validation.ts', import.meta.url), 'utf8')
const validator = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

function completeInspection() {
  return {
    meta: {
      clientName: 'Voorbeeld B.V.',
      projectLocation: 'Hoofdlocatie',
      projectAddress: 'Voorbeeldstraat 1',
      projectPostalCode: '1234 AB',
      projectCity: 'Utrecht',
      inspectionCompany: 'B2Inspect B.V.',
      inspectorName: 'Bevoegde inspecteur',
      sciosRegistrationNumber: 'SCIOS-1234',
      date: '2026-11-02',
      totalComponents: 25,
      usageFunctions: { kantoorfunctie: true },
      inspectionInterval: 3,
      completionConfirmed: true,
      signatureUrl: 'data:image/png;base64,signature',
    },
    measurements: {
      installationType: 'TN-S',
      mainFuse: '3x80A',
      mainsVoltage: '400V',
      yearOfConstruction: '2020',
      selectedInstruments: [{ name: 'Installatietester', serialNumber: 'SN-1', calibrationDate: '2027-01-01' }],
      boards: [{ name: 'Hoofdverdeler', switchboardTemp: 24, insulationResistance: 999, impedance: 0.35 }],
    },
    defects: [],
  }
}

test('complete inspectie mag worden ingediend', () => {
  const input = completeInspection()
  assert.equal(validator.validateInspectionForSubmission(input.meta, input.measurements, input.defects).valid, true)
})

test('ontbrekende velden worden per sectie geblokkeerd', () => {
  const result = validator.validateInspectionForSubmission({}, {}, [])
  assert.equal(result.valid, false)
  assert.ok(result.bySection.setup.length > 0)
  assert.ok(result.bySection.measure.length > 0)
  assert.ok(result.bySection.report.length > 0)
})

test('verlopen of onbekende kalibratie wordt geweigerd', () => {
  const input = completeInspection()
  input.measurements.selectedInstruments[0].calibrationDate = '2026-11-01'
  const result = validator.validateInspectionForSubmission(input.meta, input.measurements, input.defects)
  assert.match(result.errors.map((error) => error.message).join(' '), /geen geldige kalibratie/)
  assert.equal(validator.isInstrumentValidForInspection(input.measurements.selectedInstruments[0], input.meta.date), false)
})

test('handtekening alleen is onvoldoende voor afronding', () => {
  const input = completeInspection()
  input.meta.clientName = ''
  input.measurements.boards = []
  const result = validator.validateInspectionForSubmission(input.meta, input.measurements, input.defects)
  assert.equal(result.valid, false)
  assert.ok(result.errors.length >= 2)
})

test('lege bijdrage wordt geweigerd', () => {
  const input = completeInspection()
  input.meta.isContributionMode = true
  input.meta.parentInspectionId = '42'
  input.measurements.boards = []
  const result = validator.validateInspectionForSubmission(input.meta, input.measurements, [])
  assert.equal(result.valid, false)
  assert.match(result.errors.map((error) => error.message).join(' '), /lege bijdrage/)
})
