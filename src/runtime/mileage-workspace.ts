// @ts-nocheck
import { Ze, g, hr } from './vendor-core'
import { qM } from './reporting-vendor'

function localDateValue(date = new Date()) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000
  return new Date(localTime).toISOString().slice(0, 10)
}

const EMPTY_CLAIM = {
  trip_date: localDateValue(),
  origin: '',
  destination: '',
  purpose: '',
  kilometers: '',
  notes: '',
}

const STATUS_LABELS = {
  pending: 'Ingediend',
  approved: 'Goedgekeurd',
  rejected: 'Afgekeurd',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T12:00:00`).toLocaleDateString('nl-NL')
}

function formatKilometers(value) {
  return `${Number(value || 0).toLocaleString('nl-NL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`
}

function cellText(cell) {
  const value = cell?.value
  if (value == null) return ''
  if (value instanceof Date) return localDateValue(value)
  if (typeof value === 'object') {
    if ('text' in value) return String(value.text || '').trim()
    if ('result' in value) return String(value.result || '').trim()
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || '').join('').trim()
  }
  return String(value).trim()
}

function parseExcelDate(cell) {
  const value = cell?.value
  if (value instanceof Date && !Number.isNaN(value.getTime())) return localDateValue(value)
  const text = cellText(cell)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
}

function claimKey(claim) {
  return [
    claim.user_id || '',
    claim.trip_date || '',
    String(claim.origin || '').trim().toLowerCase(),
    String(claim.destination || '').trim().toLowerCase(),
    Number(claim.kilometers || 0).toFixed(1),
  ].join('|')
}

function MileageWorkspace({ userId, userRole, onBack }) {
  const isAdmin = userRole === 'admin'
  const [claims, setClaims] = Ze.useState([])
  const [profiles, setProfiles] = Ze.useState({})
  const [form, setForm] = Ze.useState(EMPTY_CLAIM)
  const [loading, setLoading] = Ze.useState(true)
  const [saving, setSaving] = Ze.useState(false)
  const [message, setMessage] = Ze.useState('')
  const [error, setError] = Ze.useState('')
  const [importing, setImporting] = Ze.useState(false)
  const fileInputRef = Ze.useRef(null)

  const loadClaims = Ze.useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await hr
      .from('mileage_claims')
      .select('*')
      .order('trip_date', { ascending: false })
      .order('submitted_at', { ascending: false })

    if (loadError) {
      console.error('Kilometerdeclaraties laden mislukt:', loadError)
      setError('De kilometerdeclaraties konden niet worden geladen.')
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
          profile.full_name || profile.email || 'Onbekende medewerker',
        ])))
      }
    }
    setLoading(false)
  }, [isAdmin])

  Ze.useEffect(() => {
    loadClaims()
  }, [loadClaims])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const submitClaim = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const kilometers = Number(String(form.kilometers).replace(',', '.'))
    if (!Number.isFinite(kilometers) || kilometers <= 0 || kilometers > 2000) {
      setError('Vul een geldig aantal kilometers in, tussen 0,1 en 2.000.')
      return
    }
    if (form.trip_date > localDateValue()) {
      setError('Een ritdatum kan niet in de toekomst liggen.')
      return
    }

    setSaving(true)
    const { error: insertError } = await hr.from('mileage_claims').insert({
      user_id: userId,
      trip_date: form.trip_date,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      purpose: form.purpose.trim(),
      kilometers: Math.round(kilometers * 10) / 10,
      notes: form.notes.trim() || null,
    })
    setSaving(false)

    if (insertError) {
      console.error('Kilometerdeclaratie indienen mislukt:', insertError)
      setError('De declaratie kon niet worden ingediend. Probeer het opnieuw.')
      return
    }

    setForm({ ...EMPTY_CLAIM, trip_date: localDateValue() })
    setMessage('Kilometerdeclaratie is ingediend.')
    await loadClaims()
  }

  const reviewClaim = async (claimId, status) => {
    setMessage('')
    setError('')
    const { data: updatedClaim, error: updateError } = await hr
      .from('mileage_claims')
      .update({
        status,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('Kilometerdeclaratie beoordelen mislukt:', updateError)
      setError('De beoordeling kon niet worden opgeslagen.')
      return
    }
    if (!updatedClaim) {
      setError('Deze declaratie is al door iemand anders beoordeeld.')
      await loadClaims()
      return
    }
    setMessage(status === 'approved' ? 'Declaratie goedgekeurd.' : 'Declaratie afgekeurd.')
    await loadClaims()
  }

  const exportClaims = async () => {
    setMessage('')
    setError('')
    try {
      const workbook = new qM.Workbook()
      const sheet = workbook.addWorksheet('Kilometerdeclaraties')
      sheet.columns = [
        { header: 'Medewerker e-mail', key: 'employeeEmail', width: 32 },
        { header: 'Ritdatum', key: 'tripDate', width: 14 },
        { header: 'Vertrekpunt', key: 'origin', width: 30 },
        { header: 'Bestemming', key: 'destination', width: 30 },
        { header: 'Reden van de rit', key: 'purpose', width: 36 },
        { header: 'Kilometers', key: 'kilometers', width: 14 },
        { header: 'Toelichting', key: 'notes', width: 40 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Ingediend op', key: 'submittedAt', width: 20 },
      ]
      claims.forEach((claim) => sheet.addRow({
        employeeEmail: claim.employee_email || '',
        tripDate: claim.trip_date,
        origin: claim.origin,
        destination: claim.destination,
        purpose: claim.purpose,
        kilometers: Number(claim.kilometers),
        notes: claim.notes || '',
        status: STATUS_LABELS[claim.status] || claim.status,
        submittedAt: claim.submitted_at ? new Date(claim.submitted_at).toLocaleString('nl-NL') : '',
      }))
      const header = sheet.getRow(1)
      header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF263C58' } }
      header.alignment = { vertical: 'middle' }
      header.height = 24
      sheet.views = [{ state: 'frozen', ySplit: 1 }]
      sheet.autoFilter = { from: 'A1', to: 'I1' }
      sheet.getColumn('kilometers').numFmt = '0.0'
      sheet.getColumn('tripDate').numFmt = 'yyyy-mm-dd'

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `B2Inspect_kilometerdeclaraties_${localDateValue()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setMessage(`Excel-bestand met ${claims.length} declaratie${claims.length === 1 ? '' : 's'} is gedownload.`)
    } catch (exportError) {
      console.error('Kilometerdeclaraties exporteren mislukt:', exportError)
      setError('Het Excel-bestand kon niet worden gemaakt.')
    }
  }

  const importClaims = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setMessage('')
    setError('')

    try {
      const workbook = new qM.Workbook()
      await workbook.xlsx.load(await file.arrayBuffer())
      const sheet = workbook.getWorksheet(1)
      if (!sheet) throw new Error('Het Excel-bestand bevat geen werkblad.')

      const headers = {}
      sheet.getRow(1).eachCell((cell, columnNumber) => {
        headers[cellText(cell).toLowerCase()] = columnNumber
      })
      const findColumn = (...names) => {
        const normalizedNames = names.map((name) => name.toLowerCase())
        const header = Object.keys(headers).find((name) => normalizedNames.includes(name))
        return header ? headers[header] : 0
      }
      const columns = {
        email: findColumn('medewerker e-mail', 'medewerker email', 'e-mail', 'email'),
        date: findColumn('ritdatum', 'datum'),
        origin: findColumn('vertrekpunt', 'van'),
        destination: findColumn('bestemming', 'naar'),
        purpose: findColumn('reden van de rit', 'reden', 'doel'),
        kilometers: findColumn('kilometers', 'km'),
        notes: findColumn('toelichting', 'opmerking', 'opmerkingen'),
      }
      const missing = [
        ['Ritdatum', columns.date],
        ['Vertrekpunt', columns.origin],
        ['Bestemming', columns.destination],
        ['Reden van de rit', columns.purpose],
        ['Kilometers', columns.kilometers],
        ...(isAdmin ? [['Medewerker e-mail', columns.email]] : []),
      ].filter(([, column]) => !column).map(([label]) => label)
      if (missing.length) throw new Error(`Verplichte kolommen ontbreken: ${missing.join(', ')}.`)

      let profileByEmail = {}
      if (isAdmin) {
        const { data: profileRows, error: profileError } = await hr
          .from('profiles')
          .select('id, email, contact_email')
          .in('role', ['admin', 'inspector'])
        if (profileError) throw profileError
        profileByEmail = Object.fromEntries((profileRows || []).flatMap((profile) => [
          profile.email ? [profile.email.toLowerCase(), profile.id] : null,
          profile.contact_email ? [profile.contact_email.toLowerCase(), profile.id] : null,
        ].filter(Boolean)))
      }

      const rows = []
      const rowErrors = []
      const existingKeys = new Set(claims.map(claimKey))
      const batchKeys = new Set()
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1 || rowErrors.length >= 20) return
        const rowHasContent = [columns.date, columns.origin, columns.destination, columns.purpose, columns.kilometers]
          .some((column) => cellText(row.getCell(column)))
        if (!rowHasContent) return

        const email = columns.email ? cellText(row.getCell(columns.email)).toLowerCase() : ''
        const targetUserId = isAdmin ? profileByEmail[email] : userId
        const tripDate = parseExcelDate(row.getCell(columns.date))
        const origin = cellText(row.getCell(columns.origin))
        const destination = cellText(row.getCell(columns.destination))
        const purpose = cellText(row.getCell(columns.purpose))
        const kilometers = Number(cellText(row.getCell(columns.kilometers)).replace(',', '.'))
        const notes = columns.notes ? cellText(row.getCell(columns.notes)) : ''
        const problems = []
        if (isAdmin && !targetUserId) problems.push(`onbekende medewerker "${email || 'leeg'}"`)
        if (!tripDate || tripDate > localDateValue()) problems.push('ongeldige ritdatum')
        if (!origin || origin.length > 200) problems.push('ongeldig vertrekpunt')
        if (!destination || destination.length > 200) problems.push('ongeldige bestemming')
        if (!purpose || purpose.length > 500) problems.push('ongeldige reden')
        if (!Number.isFinite(kilometers) || kilometers <= 0 || kilometers > 2000) problems.push('ongeldige kilometers')
        if (notes.length > 1000) problems.push('toelichting is te lang')
        if (problems.length) {
          rowErrors.push(`Rij ${rowNumber}: ${problems.join(', ')}`)
          return
        }

        const claim = {
          user_id: targetUserId,
          trip_date: tripDate,
          origin,
          destination,
          purpose,
          kilometers: Math.round(kilometers * 10) / 10,
          notes: notes || null,
        }
        const key = claimKey(claim)
        if (existingKeys.has(key) || batchKeys.has(key)) {
          rowErrors.push(`Rij ${rowNumber}: deze rit is al aanwezig`)
          return
        }
        batchKeys.add(key)
        rows.push(claim)
      })

      if (sheet.rowCount > 501) throw new Error('Een import mag maximaal 500 declaratieregels bevatten.')
      if (rowErrors.length) throw new Error(`Import niet uitgevoerd. Corrigeer eerst:\n${rowErrors.slice(0, 10).join('\n')}`)
      if (!rows.length) throw new Error('Geen declaratieregels gevonden om te importeren.')

      const { error: insertError } = await hr.from('mileage_claims').insert(rows)
      if (insertError) throw insertError
      setMessage(`${rows.length} kilometerdeclaratie${rows.length === 1 ? '' : 's'} als ingediend geïmporteerd.`)
      await loadClaims()
    } catch (importError) {
      console.error('Kilometerdeclaraties importeren mislukt:', importError)
      setError(importError instanceof Error ? importError.message : 'Het Excel-bestand kon niet worden geïmporteerd.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const totalKilometers = claims.reduce((sum, claim) => sum + Number(claim.kilometers || 0), 0)

  return g.jsxs('main', {
    className: 'ig-mileage-shell',
    'data-ui': 'mileage-claims',
    children: [
      g.jsx('header', {
        className: 'ig-mileage-header',
        children: g.jsxs('div', {
          className: 'ig-mileage-header-inner',
          children: [
            g.jsx('button', {
              type: 'button',
              onClick: onBack,
              className: 'ig-mileage-back',
              'aria-label': 'Terug naar inspecteren',
              children: '← Terug',
            }),
            g.jsxs('div', {
              children: [
                g.jsx('p', { className: 'ig-mileage-eyebrow', children: 'B2Inspect' }),
                g.jsx('h1', { children: 'Kilometerdeclaraties' }),
              ],
            }),
          ],
        }),
      }),
      g.jsxs('div', {
        className: 'ig-mileage-content',
        children: [
          g.jsxs('section', {
            className: 'ig-mileage-card',
            children: [
              g.jsx('h2', { children: 'Nieuwe rit declareren' }),
              g.jsx('p', {
                className: 'ig-mileage-help',
                children: 'Vul het totaal aantal zakelijk gereden kilometers van deze rit in.',
              }),
              g.jsxs('form', {
                onSubmit: submitClaim,
                className: 'ig-mileage-form',
                children: [
                  g.jsxs('label', {
                    children: [
                      g.jsx('span', { children: 'Ritdatum' }),
                      g.jsx('input', {
                        type: 'date',
                        required: true,
                        max: localDateValue(),
                        value: form.trip_date,
                        onChange: updateField('trip_date'),
                      }),
                    ],
                  }),
                  g.jsxs('label', {
                    children: [
                      g.jsx('span', { children: 'Vertrekpunt' }),
                      g.jsx('input', {
                        type: 'text',
                        required: true,
                        maxLength: 200,
                        placeholder: 'Straat, plaats of kantoor',
                        value: form.origin,
                        onChange: updateField('origin'),
                      }),
                    ],
                  }),
                  g.jsxs('label', {
                    children: [
                      g.jsx('span', { children: 'Bestemming' }),
                      g.jsx('input', {
                        type: 'text',
                        required: true,
                        maxLength: 200,
                        placeholder: 'Klant of inspectielocatie',
                        value: form.destination,
                        onChange: updateField('destination'),
                      }),
                    ],
                  }),
                  g.jsxs('label', {
                    children: [
                      g.jsx('span', { children: 'Reden van de rit' }),
                      g.jsx('input', {
                        type: 'text',
                        required: true,
                        maxLength: 500,
                        placeholder: 'Bijvoorbeeld: Scope 10-inspectie',
                        value: form.purpose,
                        onChange: updateField('purpose'),
                      }),
                    ],
                  }),
                  g.jsxs('label', {
                    children: [
                      g.jsx('span', { children: 'Totaal gereden kilometers' }),
                      g.jsx('input', {
                        type: 'number',
                        required: true,
                        min: '0.1',
                        max: '2000',
                        step: '0.1',
                        inputMode: 'decimal',
                        placeholder: '0,0',
                        value: form.kilometers,
                        onChange: updateField('kilometers'),
                      }),
                    ],
                  }),
                  g.jsxs('label', {
                    className: 'ig-mileage-wide',
                    children: [
                      g.jsx('span', { children: 'Toelichting (optioneel)' }),
                      g.jsx('textarea', {
                        rows: 3,
                        maxLength: 1000,
                        placeholder: 'Bijzonderheden over de rit',
                        value: form.notes,
                        onChange: updateField('notes'),
                      }),
                    ],
                  }),
                  g.jsx('button', {
                    type: 'submit',
                    disabled: saving,
                    className: 'ig-mileage-submit ig-mileage-wide',
                    children: saving ? 'Indienen…' : 'Declaratie indienen',
                  }),
                ],
              }),
            ],
          }),
          g.jsxs('section', {
            className: 'ig-mileage-card',
            children: [
              g.jsxs('div', {
                className: 'ig-mileage-list-heading',
                children: [
                  g.jsxs('div', {
                    children: [
                      g.jsx('h2', { children: isAdmin ? 'Alle declaraties' : 'Mijn declaraties' }),
                      g.jsx('p', {
                        className: 'ig-mileage-help',
                        children: `${claims.length} declaratie${claims.length === 1 ? '' : 's'} · ${formatKilometers(totalKilometers)}`,
                      }),
                    ],
                  }),
                  g.jsxs('div', {
                    className: 'ig-mileage-toolbar',
                    children: [
                      g.jsx('input', {
                        ref: fileInputRef,
                        type: 'file',
                        accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        onChange: importClaims,
                        className: 'ig-mileage-file-input',
                        'aria-label': 'Excel-bestand met kilometerdeclaraties selecteren',
                      }),
                      g.jsx('button', {
                        type: 'button',
                        onClick: () => fileInputRef.current?.click(),
                        disabled: importing,
                        className: 'ig-mileage-refresh',
                        children: importing ? 'Inladen…' : 'Excel inladen',
                      }),
                      g.jsx('button', {
                        type: 'button',
                        onClick: exportClaims,
                        className: 'ig-mileage-refresh',
                        children: 'Excel downloaden',
                      }),
                      g.jsx('button', {
                        type: 'button',
                        onClick: loadClaims,
                        className: 'ig-mileage-refresh',
                        children: 'Vernieuwen',
                      }),
                    ],
                  }),
                ],
              }),
              g.jsx('div', {
                className: 'ig-mileage-message',
                role: 'status',
                'aria-live': 'polite',
                children: message,
              }),
              error && g.jsx('p', { className: 'ig-mileage-error', role: 'alert', children: error }),
              loading
                ? g.jsx('p', { className: 'ig-mileage-empty', children: 'Declaraties laden…' })
                : claims.length === 0
                  ? g.jsx('p', { className: 'ig-mileage-empty', children: 'Er zijn nog geen kilometerdeclaraties.' })
                  : g.jsx('div', {
                      className: 'ig-mileage-list',
                      children: claims.map((claim) => g.jsxs('article', {
                        className: 'ig-mileage-claim',
                        children: [
                          g.jsxs('div', {
                            className: 'ig-mileage-claim-top',
                            children: [
                              g.jsxs('div', {
                                children: [
                                  isAdmin && g.jsx('p', {
                                    className: 'ig-mileage-employee',
                                    children: profiles[claim.user_id] || claim.employee_email || 'Onbekende medewerker',
                                  }),
                                  g.jsxs('h3', { children: [claim.origin, ' → ', claim.destination] }),
                                  g.jsxs('p', { children: [formatDate(claim.trip_date), ' · ', claim.purpose] }),
                                ],
                              }),
                              g.jsx('strong', { children: formatKilometers(claim.kilometers) }),
                            ],
                          }),
                          claim.notes && g.jsx('p', { className: 'ig-mileage-notes', children: claim.notes }),
                          g.jsxs('div', {
                            className: 'ig-mileage-claim-footer',
                            children: [
                              g.jsx('span', {
                                className: `ig-mileage-status is-${claim.status}`,
                                children: STATUS_LABELS[claim.status] || claim.status,
                              }),
                              isAdmin && claim.status === 'pending' && g.jsxs('div', {
                                className: 'ig-mileage-actions',
                                children: [
                                  g.jsx('button', {
                                    type: 'button',
                                    onClick: () => reviewClaim(claim.id, 'rejected'),
                                    className: 'is-reject',
                                    children: 'Afkeuren',
                                  }),
                                  g.jsx('button', {
                                    type: 'button',
                                    onClick: () => reviewClaim(claim.id, 'approved'),
                                    className: 'is-approve',
                                    children: 'Goedkeuren',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }, claim.id)),
                    }),
            ],
          }),
        ],
      }),
    ],
  })
}

export { MileageWorkspace }
