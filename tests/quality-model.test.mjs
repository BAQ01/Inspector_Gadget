import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/runtime/quality-model.ts', import.meta.url), 'utf8')
const model = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

test('gereedheidspercentage telt alleen toepasselijke eisen', () => {
  const result = model.qualityReadiness([
    { status: 'ready' },
    { status: 'in_progress' },
    { status: 'missing' },
    { status: 'not_applicable' },
  ])
  assert.deepEqual(result, { total: 3, ready: 1, inProgress: 1, missing: 1, percentage: 33 })
})

test('verlopen, naderende en geldige datums worden onderscheiden', () => {
  assert.equal(model.dueState('2026-11-02', '2026-11-03'), 'expired')
  assert.equal(model.dueState('2026-12-01', '2026-11-03'), 'warning')
  assert.equal(model.dueState('2027-06-01', '2026-11-03'), 'valid')
  assert.equal(model.dueState('', '2026-11-03'), 'unknown')
})

test('geblokkeerde of niet-gekalibreerde meetmiddelen zijn niet beschikbaar', () => {
  assert.equal(model.instrumentAvailability({ status: 'blocked', calibration_due_date: '2027-01-01' }, '2026-11-03'), 'blocked')
  assert.equal(model.instrumentAvailability({ status: 'active', calibration_due_date: '2026-11-02' }, '2026-11-03'), 'blocked')
  assert.equal(model.instrumentAvailability({ status: 'active', calibration_due_date: '2027-01-01' }, '2026-11-03'), 'warning')
})

test('kritieke of verlopen open kwaliteitsacties zijn een risico', () => {
  assert.equal(model.openQualityRisk({ status: 'open', severity: 'critical' }, '2026-11-03'), true)
  assert.equal(model.openQualityRisk({ status: 'open', severity: 'normal', due_date: '2026-11-02' }, '2026-11-03'), true)
  assert.equal(model.openQualityRisk({ status: 'completed', severity: 'critical' }, '2026-11-03'), false)
})
