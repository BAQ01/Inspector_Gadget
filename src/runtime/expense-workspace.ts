// @ts-nocheck
import { Ze, ac, g, hr } from './vendor-core'
import { qM } from './reporting-vendor'
import { ClaimReviewDialog } from './claim-review-dialog'

const RECEIPT_BUCKET = 'expense-receipts'
const MAX_RECEIPT_SIZE = 10 * 1024 * 1024
const ALLOWED_RECEIPT_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

const CATEGORY_LABELS = {
  parking: 'Parkeren',
  public_transport: 'Openbaar vervoer',
  materials: 'Materialen',
  meals: 'Maaltijd',
  accommodation: 'Overnachting',
  other: 'Overig',
}

const STATUS_LABELS = {
  pending: 'Ingediend',
  approved: 'Goedgekeurd',
  rejected: 'Afgekeurd',
}

function localDateValue(date = new Date()) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000
  return new Date(localTime).toISOString().slice(0, 10)
}

const EMPTY_EXPENSE = {
  expense_date: localDateValue(),
  category: 'parking',
  description: '',
  amount: '',
  notes: '',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T12:00:00`).toLocaleDateString('nl-NL')
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
}

function safeReceiptName(name) {
  return String(name || 'bon').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 255) || 'bon'
}

function ExpenseWorkspace({ userId, userRole, onBack, onOpenMileage }) {
  const isAdmin = userRole === 'admin'
  const [claims, setClaims] = Ze.useState([])
  const [profiles, setProfiles] = Ze.useState({})
  const [form, setForm] = Ze.useState(EMPTY_EXPENSE)
  const [receipt, setReceipt] = Ze.useState(null)
  const [loading, setLoading] = Ze.useState(true)
  const [saving, setSaving] = Ze.useState(false)
  const [reviewingId, setReviewingId] = Ze.useState('')
  const [reviewRequest, setReviewRequest] = Ze.useState(null)
  const [downloadingId, setDownloadingId] = Ze.useState('')
  const [message, setMessage] = Ze.useState('')
  const [error, setError] = Ze.useState('')
  const receiptInputRef = Ze.useRef(null)

  const loadClaims = Ze.useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await hr
      .from('expense_claims')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('submitted_at', { ascending: false })

    if (loadError) {
      console.error('Onkostendeclaraties laden mislukt:', loadError)
      setError('De onkostendeclaraties konden niet worden geladen.')
      setLoading(false)
      return
    }

    setClaims(data || [])
    if (isAdmin) {
      const { data: profileRows, error: profileError } = await hr
        .from('profiles')
        .select('id, full_name, email, contact_email')
        .in('role', ['admin', 'inspector'])
      if (profileError) {
        console.error('Medewerkers laden mislukt:', profileError)
      } else {
        setProfiles(Object.fromEntries((profileRows || []).map((profile) => [
          profile.id,
          profile.full_name || profile.email || profile.contact_email || 'Onbekende medewerker',
        ])))
      }
    }
    setLoading(false)
  }, [isAdmin])

  Ze.useEffect(() => { loadClaims() }, [loadClaims])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const validateReceipt = (file) => {
    if (!file) return 'Voeg een bon toe als pdf of afbeelding.'
    if (!ALLOWED_RECEIPT_TYPES[file.type]) return 'Gebruik een pdf-, JPG-, PNG-, WebP- of HEIC-bestand.'
    if (file.size <= 0 || file.size > MAX_RECEIPT_SIZE) return 'De bon mag maximaal 10 MB groot zijn.'
    return ''
  }

  const submitClaim = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const amount = Number(String(form.amount).replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0 || amount > 25000) {
      setError('Vul een geldig bedrag in tussen € 0,01 en € 25.000.')
      return
    }
    if (form.expense_date > localDateValue()) {
      setError('De datum van de uitgave kan niet in de toekomst liggen.')
      return
    }
    const receiptError = validateReceipt(receipt)
    if (receiptError) {
      setError(receiptError)
      return
    }

    setSaving(true)
    const receiptPath = `${userId}/${crypto.randomUUID()}.${ALLOWED_RECEIPT_TYPES[receipt.type]}`
    const { error: uploadError } = await hr.storage.from(RECEIPT_BUCKET).upload(receiptPath, receipt, {
      cacheControl: '3600',
      contentType: receipt.type,
      upsert: false,
    })
    if (uploadError) {
      console.error('Bon uploaden mislukt:', uploadError)
      setError('De bon kon niet veilig worden opgeslagen. Probeer het opnieuw.')
      setSaving(false)
      return
    }

    const { data: insertedClaim, error: insertError } = await hr.from('expense_claims').insert({
      user_id: userId,
      expense_date: form.expense_date,
      category: form.category,
      description: form.description.trim(),
      amount: Math.round(amount * 100) / 100,
      notes: form.notes.trim() || null,
      receipt_path: receiptPath,
      receipt_name: safeReceiptName(receipt.name),
      receipt_mime_type: receipt.type,
      receipt_size: receipt.size,
    }).select('id').single()
    if (insertError) {
      await hr.storage.from(RECEIPT_BUCKET).remove([receiptPath])
      console.error('Onkostendeclaratie indienen mislukt:', insertError)
      setError('De declaratie kon niet worden ingediend. De geüploade bon is opgeruimd.')
      setSaving(false)
      return
    }

    setForm({ ...EMPTY_EXPENSE, expense_date: localDateValue() })
    setReceipt(null)
    if (receiptInputRef.current) receiptInputRef.current.value = ''
    await ac(isAdmin ? 'admin' : 'inspector', 'expense_claim_submitted', 'expense_claim', insertedClaim?.id || null, form.description || form.category, {
      bedrag: amount,
      datum: form.expense_date,
    })
    setMessage('Onkostendeclaratie met bon is ingediend.')
    setSaving(false)
    await loadClaims()
  }

  const reviewClaim = async (claimId, status, reviewNote) => {
    setReviewingId(claimId)
    setMessage('')
    setError('')
    const { data: updatedClaim, error: updateError } = await hr
      .from('expense_claims')
      .update({ status, reviewed_by: userId, reviewed_at: new Date().toISOString(), review_note: reviewNote || null })
      .eq('id', claimId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    setReviewingId('')
    if (updateError) {
      console.error('Onkostendeclaratie beoordelen mislukt:', updateError)
      setError('De beoordeling kon niet worden opgeslagen.')
      return
    }
    if (!updatedClaim) {
      setError('Deze declaratie is al door iemand anders beoordeeld.')
      await loadClaims()
      return
    }
    await ac('admin', status === 'approved' ? 'expense_claim_approved' : 'expense_claim_rejected', 'expense_claim', claimId, 'Onkostendeclaratie', reviewNote ? { toelichting: reviewNote } : undefined)
    setReviewRequest(null)
    setMessage(status === 'approved' ? 'Declaratie goedgekeurd.' : 'Declaratie afgekeurd.')
    await loadClaims()
  }

  const downloadReceipt = async (claim) => {
    setDownloadingId(claim.id)
    setError('')
    const { data, error: downloadError } = await hr.storage.from(RECEIPT_BUCKET).download(claim.receipt_path)
    setDownloadingId('')
    if (downloadError || !data) {
      console.error('Bon downloaden mislukt:', downloadError)
      setError('De bon kon niet worden geopend.')
      return
    }
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = safeReceiptName(claim.receipt_name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const exportClaims = async () => {
    setMessage('')
    setError('')
    try {
      const workbook = new qM.Workbook()
      const sheet = workbook.addWorksheet('Onkostendeclaraties')
      sheet.columns = [
        { header: 'Medewerker e-mail', key: 'employeeEmail', width: 32 },
        { header: 'Datum', key: 'expenseDate', width: 14 },
        { header: 'Categorie', key: 'category', width: 22 },
        { header: 'Omschrijving', key: 'description', width: 42 },
        { header: 'Bedrag incl. btw', key: 'amount', width: 18 },
        { header: 'Toelichting', key: 'notes', width: 40 },
        { header: 'Bonbestand', key: 'receiptName', width: 30 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Ingediend op', key: 'submittedAt', width: 20 },
        { header: 'Beoordeeld door', key: 'reviewedBy', width: 28 },
        { header: 'Beoordeeld op', key: 'reviewedAt', width: 20 },
        { header: 'Beoordelingsnotitie', key: 'reviewNote', width: 42 },
      ]
      claims.forEach((claim) => sheet.addRow({
        employeeEmail: claim.employee_email || '',
        expenseDate: claim.expense_date,
        category: CATEGORY_LABELS[claim.category] || claim.category,
        description: claim.description,
        amount: Number(claim.amount),
        notes: claim.notes || '',
        receiptName: claim.receipt_name,
        status: STATUS_LABELS[claim.status] || claim.status,
        submittedAt: claim.submitted_at ? new Date(claim.submitted_at).toLocaleString('nl-NL') : '',
        reviewedBy: claim.reviewed_by ? profiles[claim.reviewed_by] || claim.reviewed_by : '',
        reviewedAt: claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleString('nl-NL') : '',
        reviewNote: claim.review_note || '',
      }))
      const header = sheet.getRow(1)
      header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF263C58' } }
      header.height = 24
      sheet.views = [{ state: 'frozen', ySplit: 1 }]
      sheet.autoFilter = { from: 'A1', to: 'L1' }
      sheet.getColumn('amount').numFmt = '€ #,##0.00'
      sheet.getColumn('expenseDate').numFmt = 'yyyy-mm-dd'
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `B2Inspect_onkostendeclaraties_${localDateValue()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setMessage(`Excel-bestand met ${claims.length} declaratie${claims.length === 1 ? '' : 's'} is gedownload.`)
    } catch (exportError) {
      console.error('Onkostendeclaraties exporteren mislukt:', exportError)
      setError('Het Excel-bestand kon niet worden gemaakt.')
    }
  }

  const approvedAmount = claims.filter(claim => claim.status === 'approved').reduce((sum, claim) => sum + Number(claim.amount || 0), 0)
  const pendingAmount = claims.filter(claim => claim.status === 'pending').reduce((sum, claim) => sum + Number(claim.amount || 0), 0)

  return g.jsxs('main', {
    className: 'ig-mileage-shell',
    'data-ui': 'expense-claims',
    children: [
      g.jsx('header', { className: 'ig-mileage-header', children: g.jsxs('div', {
        className: 'ig-mileage-header-inner',
        children: [
          g.jsx('button', { type: 'button', onClick: onBack, className: 'ig-mileage-back', 'aria-label': 'Terug naar inspecteren', children: '← Terug' }),
          g.jsxs('div', { className: 'ig-claims-heading', children: [
            g.jsx('p', { className: 'ig-mileage-eyebrow', children: 'B2Inspect' }),
            g.jsx('h1', { children: 'Declaraties' }),
          ] }),
          g.jsxs('nav', { className: 'ig-claims-tabs', 'aria-label': 'Soort declaratie', children: [
            g.jsx('button', { type: 'button', onClick: onOpenMileage, children: 'Kilometers' }),
            g.jsx('button', { type: 'button', className: 'is-active', 'aria-current': 'page', children: 'Overige onkosten' }),
          ] }),
        ],
      }) }),
      g.jsxs('div', { className: 'ig-mileage-content', children: [
        g.jsxs('section', { className: 'ig-mileage-card', children: [
          g.jsx('h2', { children: 'Nieuwe onkosten declareren' }),
          g.jsx('p', { className: 'ig-mileage-help', children: 'Vul de uitgave in en voeg de originele bon toe. Het bedrag is inclusief btw.' }),
          g.jsxs('form', { onSubmit: submitClaim, className: 'ig-mileage-form', children: [
            g.jsxs('label', { children: [g.jsx('span', { children: 'Datum uitgave' }), g.jsx('input', { type: 'date', required: true, max: localDateValue(), value: form.expense_date, onChange: updateField('expense_date') })] }),
            g.jsxs('label', { children: [g.jsx('span', { children: 'Categorie' }), g.jsx('select', { required: true, value: form.category, onChange: updateField('category'), children: Object.entries(CATEGORY_LABELS).map(([value, label]) => g.jsx('option', { value, children: label }, value)) })] }),
            g.jsxs('label', { className: 'ig-mileage-wide', children: [g.jsx('span', { children: 'Omschrijving' }), g.jsx('input', { type: 'text', required: true, maxLength: 500, placeholder: 'Bijvoorbeeld: parkeerkosten inspectielocatie', value: form.description, onChange: updateField('description') })] }),
            g.jsxs('label', { children: [g.jsx('span', { children: 'Bedrag incl. btw' }), g.jsx('input', { type: 'number', required: true, min: '0.01', max: '25000', step: '0.01', inputMode: 'decimal', placeholder: '0,00', value: form.amount, onChange: updateField('amount') })] }),
            g.jsxs('label', { children: [g.jsx('span', { children: 'Bon (verplicht, max. 10 MB)' }), g.jsx('input', { ref: receiptInputRef, type: 'file', required: true, accept: 'application/pdf,image/jpeg,image/png,image/webp,image/heic,.heic', onChange: (event) => setReceipt(event.target.files?.[0] || null) })] }),
            g.jsxs('label', { className: 'ig-mileage-wide', children: [g.jsx('span', { children: 'Toelichting (optioneel)' }), g.jsx('textarea', { rows: 3, maxLength: 1000, placeholder: 'Aanvullende informatie voor de beoordeling', value: form.notes, onChange: updateField('notes') })] }),
            g.jsx('button', { type: 'submit', disabled: saving, className: 'ig-mileage-submit ig-mileage-wide', children: saving ? 'Bon uploaden en indienen…' : 'Declaratie indienen' }),
          ] }),
        ] }),
        g.jsxs('section', { className: 'ig-mileage-card', children: [
          g.jsxs('div', { className: 'ig-mileage-list-heading', children: [
            g.jsxs('div', { children: [g.jsx('h2', { children: isAdmin ? 'Alle onkosten' : 'Mijn onkosten' }), g.jsx('p', { className: 'ig-mileage-help', children: `${claims.length} declaratie${claims.length === 1 ? '' : 's'} · goedgekeurd ${formatCurrency(approvedAmount)} · in behandeling ${formatCurrency(pendingAmount)}` })] }),
            g.jsxs('div', { className: 'ig-mileage-toolbar', children: [
              g.jsx('button', { type: 'button', onClick: exportClaims, className: 'ig-mileage-refresh', children: 'Excel downloaden' }),
              g.jsx('button', { type: 'button', onClick: loadClaims, className: 'ig-mileage-refresh', children: 'Vernieuwen' }),
            ] }),
          ] }),
          g.jsx('div', { className: 'ig-mileage-message', role: 'status', 'aria-live': 'polite', children: message }),
          error && g.jsx('p', { className: 'ig-mileage-error', role: 'alert', children: error }),
          loading ? g.jsx('p', { className: 'ig-mileage-empty', children: 'Declaraties laden…' }) : claims.length === 0 ? g.jsx('p', { className: 'ig-mileage-empty', children: 'Er zijn nog geen onkostendeclaraties.' }) : g.jsx('div', {
            className: 'ig-mileage-list',
            children: claims.map((claim) => g.jsxs('article', { className: 'ig-mileage-claim', children: [
              g.jsxs('div', { className: 'ig-mileage-claim-top', children: [
                g.jsxs('div', { children: [
                  isAdmin && g.jsx('p', { className: 'ig-mileage-employee', children: profiles[claim.user_id] || claim.employee_email || 'Onbekende medewerker' }),
                  g.jsx('h3', { children: claim.description }),
                  g.jsxs('p', { children: [formatDate(claim.expense_date), ' · ', CATEGORY_LABELS[claim.category] || claim.category] }),
                ] }),
                g.jsx('strong', { children: formatCurrency(claim.amount) }),
              ] }),
              claim.notes && g.jsx('p', { className: 'ig-mileage-notes', children: claim.notes }),
              claim.reviewed_at && g.jsxs('p', { className: 'ig-mileage-notes', children: ['Beoordeeld door ', profiles[claim.reviewed_by] || 'beheer', ' op ', new Date(claim.reviewed_at).toLocaleString('nl-NL'), claim.review_note ? ` · ${claim.review_note}` : ''] }),
              g.jsxs('div', { className: 'ig-expense-receipt-row', children: [
                g.jsxs('span', { children: ['Bon: ', claim.receipt_name] }),
                g.jsx('button', { type: 'button', className: 'ig-mileage-refresh', disabled: downloadingId === claim.id, onClick: () => downloadReceipt(claim), children: downloadingId === claim.id ? 'Downloaden…' : 'Bon downloaden' }),
              ] }),
              g.jsxs('div', { className: 'ig-mileage-claim-footer', children: [
                g.jsx('span', { className: `ig-mileage-status is-${claim.status}`, children: STATUS_LABELS[claim.status] || claim.status }),
                isAdmin && claim.status === 'pending' && g.jsxs('div', { className: 'ig-mileage-actions', children: [
                  g.jsx('button', { type: 'button', disabled: reviewingId === claim.id, onClick: () => setReviewRequest({ id: claim.id, status: 'rejected' }), className: 'is-reject', children: 'Afkeuren' }),
                  g.jsx('button', { type: 'button', disabled: reviewingId === claim.id, onClick: () => setReviewRequest({ id: claim.id, status: 'approved' }), className: 'is-approve', children: 'Goedkeuren' }),
                ] }),
              ] }),
            ] }, claim.id)),
          }),
        ] }),
      ] }),
      g.jsx(ClaimReviewDialog, { request: reviewRequest, busy: Boolean(reviewingId), onCancel: () => setReviewRequest(null), onConfirm: note => reviewClaim(reviewRequest.id, reviewRequest.status, note) }),
    ],
  })
}

export { ExpenseWorkspace }
