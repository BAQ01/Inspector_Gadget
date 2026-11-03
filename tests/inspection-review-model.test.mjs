import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/runtime/inspection-review-model.ts', import.meta.url), 'utf8')
const model = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

const completeChecks = Object.fromEntries(model.REQUIRED_REVIEW_CHECKS.map((key) => [key, true]))

test('eigen inspectie wordt betrouwbaar herkend op gebruikers-id', () => {
  const request = { report_data: { meta: { assignedInspectorId: 'user-1' } } }
  assert.equal(model.isSelfReview(request, 'user-1'), true)
  assert.equal(model.isSelfReview(request, 'user-2'), false)
  assert.equal(model.reviewIndependenceMode(request, 'user-1'), 'self_review_exception')
  assert.equal(model.reviewIndependenceMode(request, 'user-2'), 'independent_review')
  assert.equal(model.reviewIndependenceMode({ report_data: { meta: {} } }, 'user-2'), 'unverified_assignment')
})

test('onvolledige checklist blokkeert definitieve afronding', () => {
  assert.equal(model.canFinalizeReview({ ...completeChecks, report_checked: false }, 'independent_review'), false)
  assert.equal(model.canFinalizeReview(completeChecks, 'independent_review'), true)
})

test('admin kan eigen inspectie alleen met gedocumenteerde afwijking afronden', () => {
  assert.equal(model.canFinalizeReview(completeChecks, 'self_review_exception', 'te kort'), false)
  assert.equal(model.canFinalizeReview(completeChecks, 'self_review_exception', 'Geen tweede reviewer beschikbaar; extra dossiercontrole uitgevoerd.'), true)
  assert.equal(model.canFinalizeReview(completeChecks, 'unverified_assignment', 'te kort'), false)
  const checklist = model.buildReviewChecklist(completeChecks, 'self_review_exception', '  Extra technische controle uitgevoerd.  ')
  assert.equal(checklist.independence_mode, 'self_review_exception')
  assert.equal(checklist.independence_note, 'Extra technische controle uitgevoerd.')
})
