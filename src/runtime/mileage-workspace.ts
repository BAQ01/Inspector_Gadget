// @ts-nocheck
import { Ze, g, hr } from './vendor-core'

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

function MileageWorkspace({ userId, userRole, onBack }) {
  const isAdmin = userRole === 'admin'
  const [claims, setClaims] = Ze.useState([])
  const [profiles, setProfiles] = Ze.useState({})
  const [form, setForm] = Ze.useState(EMPTY_CLAIM)
  const [loading, setLoading] = Ze.useState(true)
  const [saving, setSaving] = Ze.useState(false)
  const [message, setMessage] = Ze.useState('')
  const [error, setError] = Ze.useState('')

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
        .select('id, full_name, email')
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
                  g.jsx('button', {
                    type: 'button',
                    onClick: loadClaims,
                    className: 'ig-mileage-refresh',
                    children: 'Vernieuwen',
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
