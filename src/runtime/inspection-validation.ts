// @ts-nocheck

function text(value) {
  return String(value ?? '').trim()
}

function positiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0
}

function validCalibrationDate(value, inspectionDate) {
  const calibration = text(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calibration)) return false
  const reference = /^\d{4}-\d{2}-\d{2}$/.test(text(inspectionDate))
    ? text(inspectionDate)
    : new Date().toISOString().slice(0, 10)
  return calibration >= reference
}

function validateBoard(board, index) {
  const prefix = `Verdeler ${index + 1}`
  const errors = []
  if (!text(board?.name)) errors.push({ section: 'measure', message: `${prefix}: naam of locatie ontbreekt.` })
  if (!positiveNumber(board?.switchboardTemp)) errors.push({ section: 'measure', message: `${prefix}: temperatuur ontbreekt of is ongeldig.` })
  if (!positiveNumber(board?.insulationResistance)) errors.push({ section: 'measure', message: `${prefix}: isolatieweerstand ontbreekt of is ongeldig.` })
  if (!positiveNumber(board?.impedance)) errors.push({ section: 'measure', message: `${prefix}: impedantie ontbreekt of is ongeldig.` })
  return errors
}

export function validateInspectionForSubmission(meta = {}, measurements = {}, defects = [], options = {}) {
  const errors = []
  const required = (condition, section, message) => {
    if (!condition) errors.push({ section, message })
  }

  required(text(meta.clientName), 'setup', 'Opdrachtgever ontbreekt.')
  required(text(meta.projectLocation), 'setup', 'Projectlocatie ontbreekt.')
  required(text(meta.projectAddress) && text(meta.projectPostalCode) && text(meta.projectCity), 'setup', 'Volledig projectadres ontbreekt.')
  required(text(meta.inspectionCompany), 'setup', 'Inspectiebedrijf ontbreekt.')
  required(text(meta.inspectorName), 'setup', 'Naam inspecteur ontbreekt.')
  required(text(meta.sciosRegistrationNumber), 'setup', 'SCIOS-registratienummer van de uitvoerende inspecteur ontbreekt.')
  required(/^\d{4}-\d{2}-\d{2}$/.test(text(meta.date)), 'setup', 'Inspectiedatum ontbreekt of is ongeldig.')
  required(positiveNumber(meta.totalComponents), 'setup', 'Totaal aantal componenten moet groter zijn dan nul.')
  required(Object.values(meta.usageFunctions || {}).some(Boolean), 'setup', 'Selecteer minimaal één gebruiksfunctie.')

  const instruments = Array.isArray(measurements.selectedInstruments) ? measurements.selectedInstruments : []
  required(text(measurements.installationType), 'measure', 'Stroomstelsel ontbreekt.')
  required(text(measurements.mainFuse), 'measure', 'Voorbeveiliging ontbreekt.')
  required(text(measurements.mainsVoltage), 'measure', 'Netspanning ontbreekt.')
  required(/^\d{4}$/.test(text(measurements.yearOfConstruction)), 'measure', 'Bouwjaar van de installatie ontbreekt of is ongeldig.')
  required(instruments.length > 0, 'measure', 'Selecteer minimaal één meetinstrument.')
  instruments.forEach((instrument) => {
    required(text(instrument?.serialNumber), 'measure', `Serienummer ontbreekt bij meetinstrument ${text(instrument?.name) || 'zonder naam'}.`)
    required(
      validCalibrationDate(instrument?.calibrationDate, meta.date),
      'measure',
      `Meetinstrument ${text(instrument?.name) || 'zonder naam'} heeft geen geldige kalibratie op de inspectiedatum.`,
    )
  })

  const boards = Array.isArray(measurements.boards) ? measurements.boards : []
  required(boards.length > 0, 'measure', 'Voeg minimaal één verdeelinrichting met meetresultaten toe.')
  boards.forEach((board, index) => errors.push(...validateBoard(board, index)))

  required(meta.inspectionInterval === 3 || meta.inspectionInterval === 5, 'report', 'Bevestig het advies voor de inspectiefrequentie.')
  required(meta.completionConfirmed === true, 'report', 'Bevestig dat de inspectie volledig is uitgevoerd en gecontroleerd.')
  if (options.requireSignature !== false) required(text(meta.signatureUrl), 'report', 'Handtekening van de inspecteur ontbreekt.')

  if (meta.isContributionMode) {
    required(text(meta.parentInspectionId), 'setup', 'De bijdrage is niet aan een hoofdinspectie gekoppeld.')
    required(boards.length > 0 || (Array.isArray(defects) && defects.length > 0), 'report', 'Een lege bijdrage kan niet worden ingediend.')
  }

  return {
    valid: errors.length === 0,
    errors,
    bySection: errors.reduce((result, error) => {
      result[error.section] = [...(result[error.section] || []), error.message]
      return result
    }, {}),
  }
}

export function isInstrumentValidForInspection(instrument, inspectionDate) {
  return Boolean(text(instrument?.name) && text(instrument?.serialNumber) && validCalibrationDate(instrument?.calibrationDate, inspectionDate))
}
