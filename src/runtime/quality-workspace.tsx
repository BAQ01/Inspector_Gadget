// @ts-nocheck
import { Ze, ac, g, hr } from './vendor-core'
import { dueState, instrumentAvailability, openQualityRisk, qualityLabels, qualityReadiness } from './quality-model'

const today = () => new Date().toISOString().slice(0, 10)
const emptyDocument = { document_code: '', title: '', category: 'Kwaliteitssysteem', version: '0.1', status: 'draft', effective_date: '', change_reason: '' }
const emptyCompetency = { user_id: '', competency_type: 'diploma', scope_code: 'Scope 8 PI', title: '', issuer: '', certificate_number: '', issued_on: '', expires_on: '', status: 'planned', notes: '' }
const emptyInstrument = { asset_code: '', name: '', manufacturer: '', model: '', serial_number: '', scopes: '8, 10', calibration_date: '', calibration_due_date: '', status: 'active', notes: '' }
const emptyRecord = { record_type: 'external_task', title: '', description: '', severity: 'normal', due_date: '', source: '', status: 'open' }

function StatusBadge({ value, kind = 'default' }) {
  const color = kind === 'danger' ? 'bg-red-100 text-red-800' : kind === 'warning' ? 'bg-amber-100 text-amber-900' : kind === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
  return g.jsx('span', { className: `inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`, children: value })
}

function QualityCard({ label, value, tone = 'neutral', help }) {
  const toneClass = tone === 'danger' ? 'border-red-200 bg-red-50' : tone === 'warning' ? 'border-amber-200 bg-amber-50' : tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
  return g.jsxs('article', { className: `rounded-2xl border p-4 ${toneClass}`, children: [
    g.jsx('p', { className: 'text-xs font-bold uppercase tracking-wide text-slate-500', children: label }),
    g.jsx('p', { className: 'mt-1 text-2xl font-extrabold text-slate-900', children: value }),
    help && g.jsx('p', { className: 'mt-1 text-xs leading-5 text-slate-500', children: help }),
  ] })
}

function SectionForm({ title, children, onSubmit, busy, submitLabel = 'Opslaan' }) {
  return g.jsxs('form', { onSubmit, className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', children: [
    g.jsx('h3', { className: 'text-base font-extrabold text-slate-900', children: title }),
    g.jsx('div', { className: 'mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3', children }),
    g.jsx('button', { type: 'submit', disabled: busy, className: 'mt-4 min-h-11 rounded-xl bg-slate-800 px-4 text-sm font-bold text-white disabled:opacity-50', children: busy ? 'Opslaan…' : submitLabel }),
  ] })
}

function Field({ label, children, className = '' }) {
  return g.jsxs('label', { className: `grid gap-1 text-sm font-semibold text-slate-700 ${className}`, children: [label, children] })
}

function QualityWorkspace() {
  const [tab, setTab] = Ze.useState('dashboard')
  const [requirements, setRequirements] = Ze.useState([])
  const [documents, setDocuments] = Ze.useState([])
  const [competencies, setCompetencies] = Ze.useState([])
  const [instruments, setInstruments] = Ze.useState([])
  const [records, setRecords] = Ze.useState([])
  const [profiles, setProfiles] = Ze.useState([])
  const [loading, setLoading] = Ze.useState(true)
  const [busy, setBusy] = Ze.useState(false)
  const [error, setError] = Ze.useState('')
  const [notice, setNotice] = Ze.useState('')
  const [documentForm, setDocumentForm] = Ze.useState(emptyDocument)
  const [documentFile, setDocumentFile] = Ze.useState(null)
  const [competencyForm, setCompetencyForm] = Ze.useState(emptyCompetency)
  const [competencyFile, setCompetencyFile] = Ze.useState(null)
  const [instrumentForm, setInstrumentForm] = Ze.useState(emptyInstrument)
  const [instrumentFile, setInstrumentFile] = Ze.useState(null)
  const [recordForm, setRecordForm] = Ze.useState(emptyRecord)
  const [recordFile, setRecordFile] = Ze.useState(null)

  const load = Ze.useCallback(async () => {
    setLoading(true)
    setError('')
    const results = await Promise.all([
      hr.from('quality_requirements').select('*').order('code'),
      hr.from('quality_documents').select('*').order('updated_at', { ascending: false }),
      hr.from('quality_competencies').select('*').order('expires_on', { ascending: true, nullsFirst: false }),
      hr.from('quality_instruments').select('*').order('asset_code'),
      hr.from('quality_records').select('*').order('created_at', { ascending: false }),
      hr.from('profiles').select('id, full_name, role, scios_nr').in('role', ['admin', 'inspector']).order('full_name'),
    ])
    const firstError = results.find((result) => result.error)?.error
    if (firstError) {
      setError(firstError.message.includes('quality_') ? 'De digitale kwaliteitsdatabase is nog niet geactiveerd. Voer eerst de gecontroleerde migratie uit.' : firstError.message)
    } else {
      setRequirements(results[0].data || [])
      setDocuments(results[1].data || [])
      setCompetencies(results[2].data || [])
      setInstruments(results[3].data || [])
      setRecords(results[4].data || [])
      setProfiles(results[5].data || [])
    }
    setLoading(false)
  }, [])

  Ze.useEffect(() => { load() }, [load])

  const uploadEvidence = async (file, folder) => {
    if (!file) return null
    const { data: auth } = await hr.auth.getUser()
    if (!auth?.user) throw new Error('Gebruiker is niet aangemeld.')
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')
    const path = `${auth.user.id}/${folder}/${crypto.randomUUID()}-${safeName}`
    const { error: uploadError } = await hr.storage.from('quality-evidence').upload(path, file, { upsert: false })
    if (uploadError) throw uploadError
    return path
  }

  const actorId = async () => (await hr.auth.getUser()).data.user?.id || null

  const runSave = async (operation, successMessage) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await operation()
      setNotice(successMessage)
      await load()
    } catch (saveError) {
      setError(saveError?.message || 'Opslaan is mislukt.')
    } finally {
      setBusy(false)
    }
  }

  const saveDocument = async (event) => {
    event.preventDefault()
    await runSave(async () => {
      const userId = await actorId()
      const filePath = await uploadEvidence(documentFile, 'documents')
      const approved = documentForm.status === 'approved'
      const payload = {
        ...documentForm,
        effective_date: documentForm.effective_date || (approved ? today() : null),
        file_path: filePath,
        approved_by: approved ? userId : null,
        approved_at: approved ? new Date().toISOString() : null,
        owner_id: userId,
      }
      const { data, error: saveError } = await hr.from('quality_documents').insert(payload).select().single()
      if (saveError) throw saveError
      await ac('admin', 'quality_document_created', 'quality_document', data.id, data.title, { code: data.document_code, version: data.version })
      setDocumentForm(emptyDocument)
      setDocumentFile(null)
    }, 'Document is beheerst geregistreerd.')
  }

  const saveCompetency = async (event) => {
    event.preventDefault()
    await runSave(async () => {
      const userId = await actorId()
      const filePath = await uploadEvidence(competencyFile, 'competencies')
      const verified = competencyForm.status === 'valid'
      const payload = { ...competencyForm, issued_on: competencyForm.issued_on || null, expires_on: competencyForm.expires_on || null, file_path: filePath, verified_by: verified ? userId : null, verified_at: verified ? new Date().toISOString() : null }
      const { data, error: saveError } = await hr.from('quality_competencies').insert(payload).select().single()
      if (saveError) throw saveError
      await ac('admin', 'quality_competency_created', 'quality_competency', data.id, data.title, { user_id: data.user_id, scope: data.scope_code })
      setCompetencyForm(emptyCompetency)
      setCompetencyFile(null)
    }, 'Competentie is geregistreerd.')
  }

  const saveInstrument = async (event) => {
    event.preventDefault()
    await runSave(async () => {
      const filePath = await uploadEvidence(instrumentFile, 'instruments')
      const payload = { ...instrumentForm, applicable_scopes: instrumentForm.scopes.split(',').map((value) => value.trim()).filter(Boolean), calibration_date: instrumentForm.calibration_date || null, calibration_due_date: instrumentForm.calibration_due_date || null, certificate_path: filePath }
      delete payload.scopes
      const { data, error: saveError } = await hr.from('quality_instruments').insert(payload).select().single()
      if (saveError) throw saveError
      await ac('admin', 'quality_instrument_created', 'quality_instrument', data.id, data.name, { serial_number: data.serial_number })
      setInstrumentForm(emptyInstrument)
      setInstrumentFile(null)
    }, 'Meetmiddel is geregistreerd.')
  }

  const saveRecord = async (event) => {
    event.preventDefault()
    await runSave(async () => {
      const userId = await actorId()
      const filePath = await uploadEvidence(recordFile, 'records')
      const { data, error: saveError } = await hr.from('quality_records').insert({ ...recordForm, due_date: recordForm.due_date || null, owner_id: userId, evidence_path: filePath }).select().single()
      if (saveError) throw saveError
      await ac('admin', 'quality_record_created', 'quality_record', data.id, data.title, { type: data.record_type, severity: data.severity })
      setRecordForm(emptyRecord)
      setRecordFile(null)
    }, 'Kwaliteitsregistratie is aangemaakt.')
  }

  const updateRequirement = async (item, status) => runSave(async () => {
    const { error: saveError } = await hr.from('quality_requirements').update({ status }).eq('id', item.id)
    if (saveError) throw saveError
    await ac('admin', 'quality_requirement_updated', 'quality_requirement', item.id, item.title, { from: item.status, to: status })
  }, 'Status van de eis is bijgewerkt.')

  const completeRecord = async (record) => {
    const effectiveness = window.prompt('Welke controle toont aan dat de actie effectief is?')
    if (!effectiveness?.trim()) return
    await runSave(async () => {
      const userId = await actorId()
      const { error: saveError } = await hr.from('quality_records').update({ status: 'completed', effectiveness_check: effectiveness.trim(), closed_by: userId, closed_at: new Date().toISOString() }).eq('id', record.id)
      if (saveError) throw saveError
      await ac('admin', 'quality_record_completed', 'quality_record', record.id, record.title, { effectiveness_check: effectiveness.trim() })
    }, 'Actie is aantoonbaar afgerond.')
  }

  const openEvidence = async (path) => {
    const { data, error: signedError } = await hr.storage.from('quality-evidence').createSignedUrl(path, 120)
    if (signedError) return setError(signedError.message)
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const readiness = qualityReadiness(requirements)
  const expiringCompetencies = competencies.filter((item) => ['expired', 'warning'].includes(dueState(item.expires_on)))
  const blockedInstruments = instruments.filter((item) => instrumentAvailability(item) === 'blocked')
  const criticalRecords = records.filter((item) => openQualityRisk(item))
  const tabs = [
    ['dashboard', 'Overzicht'], ['requirements', 'Eisen'], ['documents', 'Documenten'], ['competencies', 'Competenties'], ['instruments', 'Meetmiddelen'], ['records', 'Audits & acties'],
  ]

  if (loading) return g.jsx('div', { className: 'rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500', children: 'Kwaliteitssysteem laden…' })

  return g.jsxs('section', { className: 'quality-workspace space-y-5', children: [
    g.jsxs('div', { className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', children: [
      g.jsxs('div', { className: 'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between', children: [
        g.jsxs('div', { children: [
          g.jsx('h2', { className: 'text-xl font-extrabold text-slate-900', children: 'Digitale SCIOS-certificering' }),
          g.jsx('p', { className: 'mt-1 text-sm text-slate-500', children: 'Eén aantoonbare keten voor eisen, bewijs, bevoegdheden, audits en Kiwa-acties.' }),
        ] }),
        g.jsx('button', { type: 'button', onClick: load, className: 'min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50', children: 'Vernieuwen' }),
      ] }),
      g.jsx('nav', { className: 'mt-4 flex gap-2 overflow-x-auto pb-1', 'aria-label': 'Kwaliteitsonderdelen', children: tabs.map(([key, label]) => g.jsx('button', { type: 'button', onClick: () => setTab(key), 'aria-current': tab === key ? 'page' : void 0, className: `min-h-10 whitespace-nowrap rounded-xl px-3 text-sm font-bold ${tab === key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`, children: label }, key)) }),
    ] }),
    error && g.jsx('p', { role: 'alert', className: 'rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800', children: error }),
    notice && g.jsx('p', { role: 'status', className: 'rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800', children: notice }),

    tab === 'dashboard' && g.jsxs(g.Fragment, { children: [
      g.jsx('div', { className: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-5', children: [
        g.jsx(QualityCard, { label: 'Gereedheid', value: `${readiness.percentage}%`, tone: readiness.percentage === 100 ? 'success' : 'warning', help: `${readiness.ready} van ${readiness.total} eisen aantoonbaar gereed` }),
        g.jsx(QualityCard, { label: 'Ontbrekende eisen', value: readiness.missing, tone: readiness.missing ? 'danger' : 'success' }),
        g.jsx(QualityCard, { label: 'Competenties aandacht', value: expiringCompetencies.length, tone: expiringCompetencies.length ? 'warning' : 'success' }),
        g.jsx(QualityCard, { label: 'Meetmiddelen geblokkeerd', value: blockedInstruments.length, tone: blockedInstruments.length ? 'danger' : 'success' }),
        g.jsx(QualityCard, { label: 'Kritieke/te late acties', value: criticalRecords.length, tone: criticalRecords.length ? 'danger' : 'success' }),
      ] }),
      g.jsxs('div', { className: 'grid gap-4 xl:grid-cols-2', children: [
        g.jsxs('article', { className: 'rounded-2xl border border-slate-200 bg-white p-4', children: [g.jsx('h3', { className: 'font-extrabold text-slate-900', children: 'Eerstvolgende certificatiestappen' }), g.jsx('ul', { className: 'mt-3 space-y-2 text-sm text-slate-600', children: requirements.filter((item) => item.status !== 'ready' && item.status !== 'not_applicable').slice(0, 6).map((item) => g.jsxs('li', { className: 'flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3', children: [g.jsxs('span', { children: [g.jsx('strong', { className: 'text-slate-800', children: item.code }), ' · ', item.title] }), g.jsx(StatusBadge, { value: qualityLabels.requirementStatus[item.status] || item.status, kind: item.status === 'missing' ? 'danger' : 'warning' })] }, item.id)) })] }),
        g.jsxs('article', { className: 'rounded-2xl border border-slate-200 bg-white p-4', children: [g.jsx('h3', { className: 'font-extrabold text-slate-900', children: 'Open kwaliteitsacties' }), records.filter((item) => !['completed', 'cancelled'].includes(item.status)).length === 0 ? g.jsx('p', { className: 'mt-3 text-sm text-slate-500', children: 'Nog geen open acties geregistreerd.' }) : g.jsx('ul', { className: 'mt-3 space-y-2', children: records.filter((item) => !['completed', 'cancelled'].includes(item.status)).slice(0, 6).map((item) => g.jsxs('li', { className: 'rounded-xl bg-slate-50 p-3', children: [g.jsx('p', { className: 'text-sm font-bold text-slate-800', children: item.title }), g.jsxs('p', { className: 'mt-1 text-xs text-slate-500', children: [qualityLabels.recordType[item.record_type] || item.record_type, item.due_date ? ` · uiterlijk ${item.due_date}` : ''] })] }, item.id)) })] }),
      ] }),
    ] }),

    tab === 'requirements' && g.jsx('div', { className: 'grid gap-3', children: requirements.map((item) => g.jsxs('article', { className: 'rounded-2xl border border-slate-200 bg-white p-4', children: [
      g.jsxs('div', { className: 'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between', children: [
        g.jsxs('div', { children: [g.jsxs('p', { className: 'text-xs font-bold uppercase tracking-wide text-slate-500', children: [item.code, ' · ', item.category] }), g.jsx('h3', { className: 'mt-1 font-extrabold text-slate-900', children: item.title }), item.notes && g.jsx('p', { className: 'mt-2 max-w-4xl text-sm leading-6 text-slate-600', children: item.notes })] }),
        g.jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [g.jsx(StatusBadge, { value: qualityLabels.sourceStatus[item.source_status] || item.source_status, kind: item.source_status === 'current' ? 'success' : 'warning' }), g.jsx('select', { value: item.status, onChange: (event) => updateRequirement(item, event.target.value), className: 'min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold', children: Object.entries(qualityLabels.requirementStatus).map(([value, label]) => g.jsx('option', { value, children: label }, value)) })] }),
      ] }),
    ] }, item.id)) }),

    tab === 'documents' && g.jsxs(g.Fragment, { children: [
      g.jsx(SectionForm, { title: 'Beheerst document registreren', onSubmit: saveDocument, busy, children: [
        g.jsx(Field, { label: 'Documentcode', children: g.jsx('input', { required: true, value: documentForm.document_code, onChange: (e) => setDocumentForm({ ...documentForm, document_code: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Titel', className: 'sm:col-span-2', children: g.jsx('input', { required: true, value: documentForm.title, onChange: (e) => setDocumentForm({ ...documentForm, title: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Categorie', children: g.jsx('input', { required: true, value: documentForm.category, onChange: (e) => setDocumentForm({ ...documentForm, category: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Versie', children: g.jsx('input', { required: true, value: documentForm.version, onChange: (e) => setDocumentForm({ ...documentForm, version: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Status', children: g.jsx('select', { value: documentForm.status, onChange: (e) => setDocumentForm({ ...documentForm, status: e.target.value }), className: 'min-h-11 rounded-xl border px-3', children: [['draft','Concept'],['review','Ter beoordeling'],['approved','Goedgekeurd'],['archived','Gearchiveerd']].map(([value,label]) => g.jsx('option',{value,children:label},value)) }) }),
        g.jsx(Field, { label: 'Ingangsdatum', children: g.jsx('input', { type: 'date', value: documentForm.effective_date, onChange: (e) => setDocumentForm({ ...documentForm, effective_date: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Bestand (PDF)', children: g.jsx('input', { type: 'file', accept: '.pdf,application/pdf', onChange: (e) => setDocumentFile(e.target.files?.[0] || null), className: 'min-h-11 rounded-xl border p-2' }) }),
        g.jsx(Field, { label: 'Wijzigingsreden', className: 'sm:col-span-2', children: g.jsx('input', { value: documentForm.change_reason, onChange: (e) => setDocumentForm({ ...documentForm, change_reason: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
      ] }),
      g.jsx('div', { className: 'grid gap-3 lg:grid-cols-2', children: documents.map((item) => g.jsxs('article', { className: 'rounded-2xl border border-slate-200 bg-white p-4', children: [g.jsxs('div', { className: 'flex items-start justify-between gap-3', children: [g.jsxs('div', { children: [g.jsx('p', { className: 'text-xs font-bold text-slate-500', children: `${item.document_code} · versie ${item.version}` }), g.jsx('h3', { className: 'mt-1 font-extrabold text-slate-900', children: item.title }), g.jsx('p', { className: 'mt-1 text-sm text-slate-500', children: item.category })] }), g.jsx(StatusBadge, { value: item.status, kind: item.status === 'approved' ? 'success' : 'warning' })] }), item.file_path && g.jsx('button', { type: 'button', onClick: () => openEvidence(item.file_path), className: 'mt-3 text-sm font-bold text-blue-700 underline', children: 'Bewijsbestand openen' })] }, item.id)) })
    ] }),

    tab === 'competencies' && g.jsxs(g.Fragment, { children: [
      g.jsx(SectionForm, { title: 'Competentie of bevoegdheid registreren', onSubmit: saveCompetency, busy, children: [
        g.jsx(Field, { label: 'Medewerker', children: g.jsx('select', { required: true, value: competencyForm.user_id, onChange: (e) => setCompetencyForm({ ...competencyForm, user_id: e.target.value }), className: 'min-h-11 rounded-xl border px-3', children: [g.jsx('option', { value: '', children: 'Selecteer medewerker' }), ...profiles.map((profile) => g.jsx('option', { value: profile.id, children: profile.full_name || profile.id }, profile.id))] }) }),
        g.jsx(Field, { label: 'Soort', children: g.jsx('select', { value: competencyForm.competency_type, onChange: (e) => setCompetencyForm({ ...competencyForm, competency_type: e.target.value }), className: 'min-h-11 rounded-xl border px-3', children: [['diploma','Diploma'],['authorization','Bevoegdverklaring'],['knowledge_test','Kennistoets'],['practice_audit','Praktijkaudit'],['training','Opleiding'],['experience','Ervaring'],['exemption','Vrijstelling']].map(([value,label]) => g.jsx('option',{value,children:label},value)) }) }),
        g.jsx(Field, { label: 'Scope', children: g.jsx('input', { value: competencyForm.scope_code, onChange: (e) => setCompetencyForm({ ...competencyForm, scope_code: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Titel', className: 'sm:col-span-2', children: g.jsx('input', { required: true, value: competencyForm.title, onChange: (e) => setCompetencyForm({ ...competencyForm, title: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Uitgevende partij', children: g.jsx('input', { value: competencyForm.issuer, onChange: (e) => setCompetencyForm({ ...competencyForm, issuer: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Certificaatnummer', children: g.jsx('input', { value: competencyForm.certificate_number, onChange: (e) => setCompetencyForm({ ...competencyForm, certificate_number: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Uitgiftedatum', children: g.jsx('input', { type: 'date', value: competencyForm.issued_on, onChange: (e) => setCompetencyForm({ ...competencyForm, issued_on: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Geldig tot', children: g.jsx('input', { type: 'date', value: competencyForm.expires_on, onChange: (e) => setCompetencyForm({ ...competencyForm, expires_on: e.target.value }), className: 'min-h-11 rounded-xl border px-3' }) }),
        g.jsx(Field, { label: 'Status', children: g.jsx('select', { value: competencyForm.status, onChange: (e) => setCompetencyForm({ ...competencyForm, status: e.target.value }), className: 'min-h-11 rounded-xl border px-3', children: [['planned','Gepland'],['valid','Geldig'],['expired','Verlopen'],['suspended','Geschorst'],['rejected','Afgewezen']].map(([value,label]) => g.jsx('option',{value,children:label},value)) }) }),
        g.jsx(Field, { label: 'Bewijsbestand', children: g.jsx('input', { type: 'file', accept: '.pdf,image/*', onChange: (e) => setCompetencyFile(e.target.files?.[0] || null), className: 'min-h-11 rounded-xl border p-2' }) }),
      ] }),
      g.jsx('div', { className: 'overflow-x-auto rounded-2xl border border-slate-200 bg-white', children: g.jsxs('table', { className: 'min-w-[800px] w-full text-sm', children: [g.jsx('thead', { className: 'bg-slate-50 text-left text-xs uppercase text-slate-500', children: g.jsxs('tr', { children: ['Medewerker','Titel','Scope','Status','Geldig tot','Bewijs'].map((label) => g.jsx('th',{className:'p-3',children:label},label)) }) }), g.jsx('tbody', { children: competencies.map((item) => { const profile = profiles.find((entry) => entry.id === item.user_id); const state = dueState(item.expires_on); return g.jsxs('tr', { className: 'border-t', children: [g.jsx('td',{className:'p-3 font-semibold',children:profile?.full_name || 'Onbekend'}),g.jsx('td',{className:'p-3',children:item.title}),g.jsx('td',{className:'p-3',children:item.scope_code || '—'}),g.jsx('td',{className:'p-3',children:g.jsx(StatusBadge,{value:item.status,kind:item.status==='valid'&&state!=='expired'?'success':'warning'})}),g.jsx('td',{className:'p-3',children:item.expires_on || 'Geen einddatum'}),g.jsx('td',{className:'p-3',children:item.file_path?g.jsx('button',{type:'button',onClick:()=>openEvidence(item.file_path),className:'font-bold text-blue-700 underline',children:'Openen'}):'—'})] }, item.id) }) })] }) })
    ] }),

    tab === 'instruments' && g.jsxs(g.Fragment, { children: [
      g.jsx(SectionForm, { title: 'Meetmiddel registreren', onSubmit: saveInstrument, busy, children: [
        g.jsx(Field,{label:'Assetcode',children:g.jsx('input',{required:true,value:instrumentForm.asset_code,onChange:(e)=>setInstrumentForm({...instrumentForm,asset_code:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Naam',children:g.jsx('input',{required:true,value:instrumentForm.name,onChange:(e)=>setInstrumentForm({...instrumentForm,name:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Serienummer',children:g.jsx('input',{required:true,value:instrumentForm.serial_number,onChange:(e)=>setInstrumentForm({...instrumentForm,serial_number:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Fabrikant',children:g.jsx('input',{value:instrumentForm.manufacturer,onChange:(e)=>setInstrumentForm({...instrumentForm,manufacturer:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Model',children:g.jsx('input',{value:instrumentForm.model,onChange:(e)=>setInstrumentForm({...instrumentForm,model:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Scopes (komma)',children:g.jsx('input',{value:instrumentForm.scopes,onChange:(e)=>setInstrumentForm({...instrumentForm,scopes:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Kalibratiedatum',children:g.jsx('input',{type:'date',value:instrumentForm.calibration_date,onChange:(e)=>setInstrumentForm({...instrumentForm,calibration_date:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Kalibratie geldig tot',children:g.jsx('input',{type:'date',value:instrumentForm.calibration_due_date,onChange:(e)=>setInstrumentForm({...instrumentForm,calibration_due_date:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Kalibratiecertificaat',children:g.jsx('input',{type:'file',accept:'.pdf,image/*',onChange:(e)=>setInstrumentFile(e.target.files?.[0]||null),className:'min-h-11 rounded-xl border p-2'})}),
      ] }),
      g.jsx('div', { className: 'grid gap-3 lg:grid-cols-2', children: instruments.map((item) => { const availability = instrumentAvailability(item); return g.jsxs('article',{className:'rounded-2xl border border-slate-200 bg-white p-4',children:[g.jsxs('div',{className:'flex items-start justify-between gap-3',children:[g.jsxs('div',{children:[g.jsx('p',{className:'text-xs font-bold text-slate-500',children:`${item.asset_code} · ${item.serial_number}`}),g.jsx('h3',{className:'mt-1 font-extrabold text-slate-900',children:item.name}),g.jsx('p',{className:'mt-1 text-sm text-slate-500',children:[item.manufacturer,item.model].filter(Boolean).join(' ')||'Geen fabrikant/model'})]}),g.jsx(StatusBadge,{value:availability==='blocked'?'Geblokkeerd':availability==='warning'?'Kalibratie verloopt':'Beschikbaar',kind:availability==='blocked'?'danger':availability==='warning'?'warning':'success'})]}),g.jsx('p',{className:'mt-3 text-sm text-slate-600',children:`Kalibratie geldig tot: ${item.calibration_due_date||'niet vastgelegd'}`}),item.certificate_path&&g.jsx('button',{type:'button',onClick:()=>openEvidence(item.certificate_path),className:'mt-2 text-sm font-bold text-blue-700 underline',children:'Kalibratiebewijs openen'})]},item.id) }) })
    ] }),

    tab === 'records' && g.jsxs(g.Fragment, { children: [
      g.jsx(SectionForm, { title: 'Audit, afwijking of certificatieactie registreren', onSubmit: saveRecord, busy, children: [
        g.jsx(Field,{label:'Type',children:g.jsx('select',{value:recordForm.record_type,onChange:(e)=>setRecordForm({...recordForm,record_type:e.target.value}),className:'min-h-11 rounded-xl border px-3',children:Object.entries(qualityLabels.recordType).map(([value,label])=>g.jsx('option',{value,children:label},value))})}),
        g.jsx(Field,{label:'Titel',className:'sm:col-span-2',children:g.jsx('input',{required:true,value:recordForm.title,onChange:(e)=>setRecordForm({...recordForm,title:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Ernst',children:g.jsx('select',{value:recordForm.severity,onChange:(e)=>setRecordForm({...recordForm,severity:e.target.value}),className:'min-h-11 rounded-xl border px-3',children:[['low','Laag'],['normal','Normaal'],['high','Hoog'],['critical','Kritiek']].map(([value,label])=>g.jsx('option',{value,children:label},value))})}),
        g.jsx(Field,{label:'Uiterste datum',children:g.jsx('input',{type:'date',value:recordForm.due_date,onChange:(e)=>setRecordForm({...recordForm,due_date:e.target.value}),className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Bron',children:g.jsx('input',{value:recordForm.source,onChange:(e)=>setRecordForm({...recordForm,source:e.target.value}),placeholder:'Bijv. interne audit of Kiwa',className:'min-h-11 rounded-xl border px-3'})}),
        g.jsx(Field,{label:'Beschrijving',className:'sm:col-span-2',children:g.jsx('textarea',{value:recordForm.description,onChange:(e)=>setRecordForm({...recordForm,description:e.target.value}),rows:3,className:'rounded-xl border p-3'})}),
        g.jsx(Field,{label:'Bewijsbestand',children:g.jsx('input',{type:'file',accept:'.pdf,image/*,.csv,.xlsx',onChange:(e)=>setRecordFile(e.target.files?.[0]||null),className:'min-h-11 rounded-xl border p-2'})}),
      ] }),
      g.jsx('div',{className:'grid gap-3',children:records.map((item)=>g.jsxs('article',{className:`rounded-2xl border bg-white p-4 ${openQualityRisk(item)?'border-red-300':'border-slate-200'}`,children:[g.jsxs('div',{className:'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',children:[g.jsxs('div',{children:[g.jsx('p',{className:'text-xs font-bold uppercase text-slate-500',children:qualityLabels.recordType[item.record_type]||item.record_type}),g.jsx('h3',{className:'mt-1 font-extrabold text-slate-900',children:item.title}),item.description&&g.jsx('p',{className:'mt-2 text-sm leading-6 text-slate-600',children:item.description}),g.jsx('p',{className:'mt-2 text-xs text-slate-500',children:item.due_date?`Uiterlijk ${item.due_date}`:'Geen uiterste datum'})]}),g.jsxs('div',{className:'flex flex-wrap gap-2',children:[g.jsx(StatusBadge,{value:item.severity,kind:item.severity==='critical'?'danger':item.severity==='high'?'warning':'default'}),g.jsx(StatusBadge,{value:item.status,kind:item.status==='completed'?'success':'warning'})]})]}),g.jsxs('div',{className:'mt-3 flex flex-wrap gap-3',children:[item.evidence_path&&g.jsx('button',{type:'button',onClick:()=>openEvidence(item.evidence_path),className:'text-sm font-bold text-blue-700 underline',children:'Bewijs openen'}),!['completed','cancelled'].includes(item.status)&&g.jsx('button',{type:'button',onClick:()=>completeRecord(item),className:'rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white',children:'Effectief afronden'})]})]},item.id))})
    ] }),
  ] })
}

export { QualityWorkspace }
