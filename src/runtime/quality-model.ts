// @ts-nocheck

const DAY = 24 * 60 * 60 * 1000

function dateValue(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null
  const parsed = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(parsed) ? parsed : null
}

export function qualityReadiness(requirements = []) {
  const applicable = requirements.filter((item) => item.status !== 'not_applicable')
  const ready = applicable.filter((item) => item.status === 'ready').length
  const inProgress = applicable.filter((item) => ['planned', 'in_progress'].includes(item.status)).length
  const missing = applicable.filter((item) => item.status === 'missing').length
  return {
    total: applicable.length,
    ready,
    inProgress,
    missing,
    percentage: applicable.length === 0 ? 0 : Math.round((ready / applicable.length) * 100),
  }
}

export function dueState(date, referenceDate = new Date().toISOString().slice(0, 10), warningDays = 60) {
  const due = dateValue(date)
  const reference = dateValue(referenceDate)
  if (due === null || reference === null) return 'unknown'
  if (due < reference) return 'expired'
  if ((due - reference) / DAY <= warningDays) return 'warning'
  return 'valid'
}

export function instrumentAvailability(instrument, referenceDate) {
  if (!instrument || instrument.status !== 'active') return 'blocked'
  const calibration = dueState(instrument.calibration_due_date, referenceDate)
  return calibration === 'valid' || calibration === 'warning' ? calibration : 'blocked'
}

export function openQualityRisk(record, referenceDate = new Date().toISOString().slice(0, 10)) {
  if (!record || ['completed', 'cancelled'].includes(record.status)) return false
  return record.severity === 'critical' || dueState(record.due_date, referenceDate, 0) === 'expired'
}

export const qualityLabels = {
  requirementStatus: {
    missing: 'Ontbreekt',
    planned: 'Gepland',
    in_progress: 'In uitvoering',
    ready: 'Aantoonbaar gereed',
    not_applicable: 'Niet van toepassing',
  },
  sourceStatus: {
    current: 'Geldend',
    transition: 'Overgang',
    draft: 'Concept',
    verification_required: 'Bevestiging nodig',
  },
  recordType: {
    external_task: 'Externe certificatieactie',
    internal_audit: 'Interne audit',
    management_review: 'Directiebeoordeling',
    finding: 'Bevinding',
    capa: 'Corrigerende maatregel',
    complaint: 'Klacht',
    supplier_review: 'Leveranciersbeoordeling',
    backup_restore_test: 'Back-up- en hersteltest',
    incident: 'Incident',
  },
}
