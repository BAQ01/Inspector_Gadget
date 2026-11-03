// @ts-nocheck

export const REQUIRED_REVIEW_CHECKS = [
  'identity_checked',
  'measurements_checked',
  'findings_checked',
  'report_checked',
  'independence_checked',
]

export function isSelfReview(request, reviewerId) {
  const inspectorId = request?.report_data?.meta?.assignedInspectorId
  return Boolean(reviewerId && inspectorId && reviewerId === inspectorId)
}

export function reviewIndependenceMode(request, reviewerId) {
  const inspectorId = request?.report_data?.meta?.assignedInspectorId
  if (!inspectorId) return 'unverified_assignment'
  return reviewerId === inspectorId ? 'self_review_exception' : 'independent_review'
}

export function canFinalizeReview(checks, reviewMode, independenceNote = '') {
  if (!REQUIRED_REVIEW_CHECKS.every((key) => checks?.[key] === true)) return false
  return reviewMode === 'independent_review' || independenceNote.trim().length >= 15
}

export function buildReviewChecklist(checks, reviewMode, independenceNote = '') {
  return {
    ...checks,
    independence_mode: reviewMode,
    independence_note: reviewMode === 'independent_review' ? null : independenceNote.trim(),
  }
}
