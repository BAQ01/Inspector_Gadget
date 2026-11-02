// @ts-nocheck
import { Ze, g } from './vendor-core'

function ClaimReviewDialog({ request, busy = false, onCancel, onConfirm }) {
  const [note, setNote] = Ze.useState('')
  Ze.useEffect(() => setNote(''), [request?.id, request?.status])
  if (!request) return null
  const rejecting = request.status === 'rejected'
  return g.jsx('div', { className: 'fixed inset-0 z-[150] flex items-end justify-center bg-black/45 sm:items-center sm:p-4', children: g.jsxs('section', {
    role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'claim-review-title', className: 'w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6', children: [
      g.jsx('h2', { id: 'claim-review-title', className: 'text-xl font-extrabold text-slate-900', children: rejecting ? 'Declaratie afkeuren' : 'Declaratie goedkeuren' }),
      g.jsx('p', { className: 'mt-2 text-sm text-slate-600', children: rejecting ? 'Geef aan waarom de declaratie wordt afgekeurd. De medewerker ziet deze reden.' : 'Controleer de declaratie en bevestig de goedkeuring.' }),
      g.jsxs('label', { className: 'mt-5 block', children: [g.jsx('span', { className: 'mb-2 block text-sm font-bold text-slate-700', children: rejecting ? 'Reden van afkeuring' : 'Notitie (optioneel)' }), g.jsx('textarea', { autoFocus: true, required: rejecting, rows: 4, maxLength: 1000, value: note, onChange: event => setNote(event.target.value), className: 'w-full rounded-xl border border-slate-300 p-3', placeholder: rejecting ? 'Beschrijf wat moet worden gecorrigeerd' : 'Eventuele administratieve notitie' })] }),
      g.jsxs('div', { className: 'mt-5 grid grid-cols-2 gap-3', children: [
        g.jsx('button', { type: 'button', onClick: onCancel, disabled: busy, className: 'min-h-11 rounded-xl border border-slate-300 font-bold text-slate-700', children: 'Annuleren' }),
        g.jsx('button', { type: 'button', disabled: busy || rejecting && !note.trim(), onClick: () => onConfirm(note.trim()), className: `min-h-11 rounded-xl font-bold text-white disabled:opacity-50 ${rejecting ? 'bg-red-700' : 'bg-emerald-700'}`, children: busy ? 'Opslaan…' : rejecting ? 'Afkeuren' : 'Goedkeuren' }),
      ] }),
    ],
  }) })
}

export { ClaimReviewDialog }
