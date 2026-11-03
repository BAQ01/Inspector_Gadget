// @ts-nocheck
import { Ze, g, hr } from './vendor-core'
import { buildReviewChecklist, canFinalizeReview, reviewIndependenceMode } from './inspection-review-model'

const CHECKS = [
  ['identity_checked', 'Opdracht, projectlocatie, scope en inspecteur zijn gecontroleerd.'],
  ['measurements_checked', 'Meetmiddelen, kalibraties en meetresultaten zijn gecontroleerd.'],
  ['findings_checked', 'Bevindingen, classificaties en foto’s zijn gecontroleerd.'],
  ['report_checked', 'Rapporttekst, conclusie en ondertekening zijn gecontroleerd.'],
  ['independence_checked', 'De functiescheiding tussen uitvoering en definitieve beoordeling is gecontroleerd.'],
]

function InspectionReviewDialog({ request, busy, onCancel, onFinalize, onReopen }) {
  const [checks, setChecks] = Ze.useState({})
  const [reason, setReason] = Ze.useState('')
  const [reviewerId, setReviewerId] = Ze.useState('')
  const [reviewerPending, setReviewerPending] = Ze.useState(false)
  Ze.useEffect(() => {
    setChecks({})
    setReason('')
  }, [request?.id, request?.status])
  Ze.useEffect(() => {
    let active = true
    if (!request) return undefined
    setReviewerPending(true)
    hr.auth.getUser().then(({ data }) => {
      if (active) setReviewerId(data.user?.id || '')
    }).finally(() => {
      if (active) setReviewerPending(false)
    })
    return () => { active = false }
  }, [request?.id])
  if (!request) return null
  const reopening = request.status === 'completed'
  const reviewMode = reviewIndependenceMode(request, reviewerId)
  const requiresIndependenceNote = reviewMode !== 'independent_review'
  const complete = canFinalizeReview(checks, reviewMode, reason)
  const finalize = () => onFinalize(buildReviewChecklist(checks, reviewMode, reason))
  return g.jsx('div', { className: 'fixed inset-0 z-[160] flex items-end justify-center bg-black/50 sm:items-center sm:p-4', children: g.jsxs('section', {
    role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'inspection-review-title', className: 'w-full max-w-xl rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6', children: [
      g.jsx('h2', { id: 'inspection-review-title', className: 'text-xl font-extrabold text-slate-900', children: reopening ? 'Definitieve inspectie heropenen' : 'Inspectie definitief afronden' }),
      g.jsx('p', { className: 'mt-2 text-sm text-slate-600', children: request.inspection_number || request.client_name || 'Inspectie' }),
      reopening ? g.jsxs('label', { className: 'mt-5 block', children: [g.jsx('span', { className: 'mb-2 block text-sm font-bold', children: 'Reden van heropening' }), g.jsx('textarea', { autoFocus: true, rows: 4, maxLength: 1000, value: reason, onChange: event => setReason(event.target.value), className: 'w-full rounded-xl border p-3', placeholder: 'Waarom moet het definitieve rapport worden herzien?' })] }) : g.jsxs('div', { className: 'mt-5 space-y-3', children: [
        CHECKS.map(([key, label]) => g.jsxs('label', { className: 'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3', children: [g.jsx('input', { type: 'checkbox', checked: Boolean(checks[key]), onChange: event => setChecks(current => ({ ...current, [key]: event.target.checked })), className: 'mt-0.5 h-5 w-5' }), g.jsx('span', { className: 'text-sm', children: label })] }, key)),
        requiresIndependenceNote && g.jsxs('label', { className: 'block rounded-xl border border-amber-300 bg-amber-50 p-3', children: [g.jsx('span', { className: 'mb-2 block text-sm font-bold text-amber-900', children: reviewMode === 'self_review_exception' ? 'Afwijkingsreden bij beoordeling van eigen inspectie' : 'Toelichting ontbrekende inspecteurkoppeling' }), g.jsx('textarea', { rows: 3, minLength: 15, maxLength: 1000, value: reason, onChange: event => setReason(event.target.value), className: 'w-full rounded-xl border p-3', placeholder: reviewMode === 'self_review_exception' ? 'Leg vast waarom geen onafhankelijke reviewer beschikbaar is en welke extra controle is uitgevoerd.' : 'Leg vast hoe de uitvoerende inspecteur is vastgesteld en hoe de functiescheiding is gecontroleerd.' })] }),
      ] }),
      g.jsxs('div', { className: 'mt-6 grid grid-cols-2 gap-3', children: [
        g.jsx('button', { type: 'button', onClick: onCancel, disabled: busy, className: 'min-h-11 rounded-xl border font-bold', children: 'Annuleren' }),
        g.jsx('button', { type: 'button', disabled: busy || reviewerPending || (reopening ? !reason.trim() : !complete), onClick: () => reopening ? onReopen(reason.trim()) : finalize(), className: 'min-h-11 rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-50', children: busy ? 'Opslaan…' : reopening ? 'Heropenen' : 'Definitief afronden' }),
      ] }),
    ],
  }) })
}

export { InspectionReviewDialog }
