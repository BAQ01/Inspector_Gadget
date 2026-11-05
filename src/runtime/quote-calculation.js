const BASE_INSPECTION_HOURS = 2
const TRAVEL_RATE_PER_KM = 0.45
const SCIOS_REGISTRATION_COST = 35

const HOURS_PER_SQUARE_METRE = {
  kantoor: 0.0016,
  industrie: 0.005,
  agrarisch: 0.006,
  zorg: 0.003,
  onderwijs: 0.0025,
  horeca: 0.0045,
  logistiek: 0.0022,
}

const DEFAULT_QUOTE_INPUT = {
  schemaVersion: 2,
  scope: '10',
  inspectionType: 'PI',
  riskClass: 'B',
  buildingType: 'kantoor',
  buildingAge: 'normaal',
  accessibility: 'goed',
  documentation: 'compleet',
  surfaceArea: 500,
  mainBoards: 1,
  subBoards: 0,
  hasSolar: false,
  solarInverters: 1,
  hasEV: false,
  evChargers: 1,
  heavyMachinery: 0,
  hasUPS: false,
  travelDistance: 25,
  outOfHours: false,
  needsLift: false,
  safetyInduction: false,
  hourlyRate: 95,
  unforeseenCosts: 0,
  hotelCosts: 0,
  parkingCosts: 0,
  manualLaborCost: null,
  manualTravelCost: null,
  manualSciosCost: null,
  manualEquipmentCost: null,
  manualOtherCost: null,
}

const hasOwn = (value, property) => Object.prototype.hasOwnProperty.call(value, property)
const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const enumValue = (value, allowed, fallback) => typeof value === 'string' && allowed.includes(value) ? value : fallback
const numberValue = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback
const booleanValue = (record, property, fallback) => hasOwn(record, property) && typeof record[property] === 'boolean' ? record[property] : fallback
const nullableMoney = value => value === null || value === undefined ? null : numberValue(value, null)
const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100

export function createDefaultQuoteInput(requestedScopes = []) {
  const includesScope8 = requestedScopes.includes('8')
  const includesScope10 = requestedScopes.includes('10')
  return {
    ...DEFAULT_QUOTE_INPUT,
    scope: includesScope8 && includesScope10 ? 'combi' : includesScope8 ? '8' : '10',
  }
}

export function normalizeQuoteInput(value, requestedScopes = []) {
  const fallback = createDefaultQuoteInput(requestedScopes)
  if (!isRecord(value)) return fallback

  return {
    schemaVersion: 2,
    scope: enumValue(value.scope, ['8', '10', 'combi'], fallback.scope),
    inspectionType: enumValue(value.inspectionType, ['PI', 'EBI'], fallback.inspectionType),
    riskClass: enumValue(value.riskClass, ['A', 'B', 'C'], fallback.riskClass),
    buildingType: enumValue(value.buildingType, ['kantoor', 'industrie', 'agrarisch', 'zorg', 'onderwijs', 'horeca', 'logistiek'], fallback.buildingType),
    buildingAge: enumValue(value.buildingAge, ['nieuw', 'normaal', 'oud'], fallback.buildingAge),
    accessibility: enumValue(value.accessibility, ['goed', 'matig', 'slecht'], fallback.accessibility),
    documentation: enumValue(value.documentation, ['compleet', 'incompleet', 'geen'], fallback.documentation),
    surfaceArea: numberValue(value.surfaceArea, fallback.surfaceArea),
    mainBoards: numberValue(value.mainBoards, fallback.mainBoards),
    subBoards: numberValue(value.subBoards, fallback.subBoards),
    hasSolar: booleanValue(value, 'hasSolar', fallback.hasSolar),
    solarInverters: numberValue(value.solarInverters, fallback.solarInverters),
    hasEV: booleanValue(value, 'hasEV', fallback.hasEV),
    evChargers: numberValue(value.evChargers, fallback.evChargers),
    heavyMachinery: numberValue(value.heavyMachinery, fallback.heavyMachinery),
    hasUPS: booleanValue(value, 'hasUPS', fallback.hasUPS),
    travelDistance: numberValue(value.travelDistance, fallback.travelDistance),
    outOfHours: booleanValue(value, 'outOfHours', fallback.outOfHours),
    needsLift: booleanValue(value, 'needsLift', fallback.needsLift),
    safetyInduction: booleanValue(value, 'safetyInduction', fallback.safetyInduction),
    hourlyRate: numberValue(value.hourlyRate, fallback.hourlyRate),
    unforeseenCosts: numberValue(value.unforeseenCosts, fallback.unforeseenCosts),
    hotelCosts: numberValue(value.hotelCosts, fallback.hotelCosts),
    parkingCosts: numberValue(value.parkingCosts, fallback.parkingCosts),
    manualLaborCost: nullableMoney(value.manualLaborCost),
    manualTravelCost: nullableMoney(value.manualTravelCost),
    manualSciosCost: nullableMoney(value.manualSciosCost),
    manualEquipmentCost: nullableMoney(value.manualEquipmentCost),
    manualOtherCost: nullableMoney(value.manualOtherCost),
  }
}

export function validateQuoteInput(input) {
  const values = [
    [input.surfaceArea, 1, 1e6, 'Oppervlakte'],
    [input.mainBoards, 0, 1e4, 'Aantal hoofdverdelers'],
    [input.subBoards, 0, 1e4, 'Aantal onderverdelers'],
    [input.solarInverters, 0, 1e4, 'Aantal omvormers'],
    [input.evChargers, 0, 1e4, 'Aantal laadpunten'],
    [input.heavyMachinery, 0, 1e4, 'Aantal zware machines'],
    [input.travelDistance, 0, 5e3, 'Reisafstand'],
    [input.hourlyRate, 1, 1e4, 'Uurtarief'],
    [input.unforeseenCosts, 0, 1e6, 'Onvoorziene kosten'],
    [input.hotelCosts, 0, 1e6, 'Verblijfskosten'],
    [input.parkingCosts, 0, 1e6, 'Parkeerkosten'],
  ]

  const manualPrices = [
    [input.manualLaborCost, 'Handmatige inspectieprijs'],
    [input.manualTravelCost, 'Handmatige reisprijs'],
    [input.manualSciosCost, 'Handmatige SCIOS-prijs'],
    [input.manualEquipmentCost, 'Handmatige materieelprijs'],
    [input.manualOtherCost, 'Handmatige overige prijs'],
  ]
  manualPrices.forEach(([value, label]) => {
    if (value !== null && value !== undefined) values.push([value, 0, 1e6, label])
  })

  for (const [value, minimum, maximum, label] of values) {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      return `${label} moet tussen ${minimum.toLocaleString('nl-NL')} en ${maximum.toLocaleString('nl-NL')} liggen.`
    }
  }

  return [input.mainBoards, input.subBoards, input.solarInverters, input.evChargers, input.heavyMachinery].every(Number.isInteger)
    ? null
    : 'Aantallen moeten hele getallen zijn.'
}

export function calculateQuote(input) {
  let hours = BASE_INSPECTION_HOURS + input.surfaceArea * HOURS_PER_SQUARE_METRE[input.buildingType]
  if (input.buildingAge === 'oud') hours *= 1.2
  if (input.buildingAge === 'nieuw') hours *= 0.9
  if (input.riskClass === 'C' && input.scope !== '10') hours *= 1.25
  if (input.riskClass === 'A' && input.scope !== '10') hours *= 0.9
  if (input.documentation === 'incompleet') hours += 1
  if (input.documentation === 'geen') hours += input.inspectionType === 'EBI' ? 3 : 1.5

  const accessMultiplier = input.accessibility === 'slecht' ? 1.5 : input.accessibility === 'matig' ? 1.2 : 1
  hours += input.mainBoards * accessMultiplier
  hours += input.subBoards * 0.6 * accessMultiplier
  hours += input.heavyMachinery * 0.5
  if (input.hasSolar) hours += input.solarInverters * 0.75
  if (input.hasEV) hours += input.evChargers * 0.5
  if (input.hasUPS) hours += 1.5
  if (input.inspectionType === 'EBI') hours *= 1.4
  if (input.scope === '10') hours += 1.5
  if (input.scope === 'combi') hours = hours * 1.35 + 1.5
  if (input.safetyInduction) hours += 1

  const roundedHours = Math.ceil(hours * 2) / 2
  const effectiveHourlyRate = input.outOfHours ? input.hourlyRate * 1.5 : input.hourlyRate
  const returnDistance = input.travelDistance * 2
  const travelHours = returnDistance / 80
  const automaticCosts = {
    laborCost: roundMoney(roundedHours * effectiveHourlyRate),
    travelCost: roundMoney(travelHours * input.hourlyRate + returnDistance * TRAVEL_RATE_PER_KM),
    sciosCost: input.scope === 'combi' ? SCIOS_REGISTRATION_COST * 2 : SCIOS_REGISTRATION_COST,
    equipmentCost: input.needsLift ? 150 : 0,
    otherCost: roundMoney(input.unforeseenCosts + input.hotelCosts + input.parkingCosts),
  }

  const laborCost = input.manualLaborCost ?? automaticCosts.laborCost
  const travelCost = input.manualTravelCost ?? automaticCosts.travelCost
  const sciosCost = input.manualSciosCost ?? automaticCosts.sciosCost
  const equipmentCost = input.manualEquipmentCost ?? automaticCosts.equipmentCost
  const otherCost = input.manualOtherCost ?? automaticCosts.otherCost
  const totalExcludingVat = roundMoney(laborCost + travelCost + sciosCost + equipmentCost + otherCost)
  const vat = roundMoney(totalExcludingVat * 0.21)

  return {
    hours: roundedHours,
    laborCost: roundMoney(laborCost),
    travelDistanceReturn: returnDistance,
    travelHours: Math.round(travelHours * 100) / 100,
    travelCost: roundMoney(travelCost),
    sciosCost: roundMoney(sciosCost),
    equipmentCost: roundMoney(equipmentCost),
    otherCost: roundMoney(otherCost),
    automaticCosts,
    totalExcludingVat,
    vat,
    totalIncludingVat: roundMoney(totalExcludingVat + vat),
  }
}
