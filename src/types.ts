// src/types.ts

// 1. CLASSIFICATIE: Bevat nu zowel oude ('Orange') als nieuwe ('Amber') termen
export type Classification = 'Red' | 'Amber' | 'Orange' | 'Yellow' | 'Blue';

// 2. BIBLIOTHEEK ITEM
export interface LibraryDefect {
  id: string;
  category: string;
  subcategory: string;
  shortName: string;
  description: string;
  classification: Classification;
  action: string;
}

// 3. BEDRIJVEN & INSPECTEURS (Voor de database lijsten)
export interface Company {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
}

export interface Inspector {
  name: string;
  sciosNr: string;
}

// 4. GEBREK (DEFECT)
export interface Defect {
  id: string;
  libraryId?: string;
  location: string;
  description: string;
  classification: Classification;
  action: string;
  photoUrl?: string;
  photoUrl2?: string;
  // Deze velden zijn nodig voor CSV import en filtering
  category?: string;
  subcategory?: string;
}

// 5. INSTRUMENT
export interface Instrument {
  id: string;
  name: string;
  serialNumber: string;
  calibrationDate: string;
}

// 6. METINGEN
// We noemen dit 'Measurements' voor het PDF rapport...
export interface Measurements {
  installationType: 'TT' | 'TN-S' | 'TN-C-S' | string; // String toegestaan voor flexibiliteit
  mainFuse: string;
  mainsVoltage: string;
  yearOfConstruction: string;
  insulationResistance: string;
  impedance: string;
  switchboardTemp: string;
  selectedInstruments: Instrument[];
  hasEnergyStorage: boolean | null;
  hasSolarSystem: boolean | null;
}

// ...maar we exporteren OOK de oude naam 'MeasurementData' als alias.
// DIT VOORKOMT RODE KRINGELS in bestanden die de oude naam nog gebruiken!
export type MeasurementData = Measurements;

// 7. GEBRUIKSFUNCTIES
export interface UsageFunctions {
  woonfunctie: boolean;
  bijeenkomstfunctie: boolean;
  celfunctie: boolean;
  gezondheidszorgfunctie: boolean;
  industriefunctie: boolean;
  kantoorfunctie: boolean;
  logiesfunctie: boolean;
  onderwijsfunctie: boolean;
  sportfunctie: boolean;
  winkelfunctie: boolean;
  overigeGebruiksfunctie: boolean;
  bouwwerkGeenGebouw: boolean;
}

// 8. INSPECTIE BASIS (NTA/Verzekering)
export interface InspectionBasis {
  nta8220: boolean;
  verzekering: boolean;
}

// 9. METADATA (Klant, Project, etc.)
export interface InspectionMeta {
  // Klant
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientContactPerson: string;
  clientPhone: string;
  clientEmail: string;

  // Cloud ID
  supabaseId?: number;

  // Project
  projectLocation: string;
  projectAddress: string;
  projectPostalCode: string;
  projectCity: string;
  projectContactPerson: string;
  projectPhone: string;
  projectEmail: string;
  installationResponsible: string; // IV'er
  idBagviewer: string;

  locationPhotoUrl?: string;

  // Inspectiepartij
  inspectionCompany: string;
  inspectionCompanyAddress: string;
  inspectionCompanyPostalCode: string;
  inspectionCompanyCity: string;
  inspectionCompanyPhone: string;
  inspectionCompanyEmail: string;
  
  inspectorName: string;
  date: string;
  sciosRegistrationNumber: string;
  sciosScope?: 'Scope 10'; 
  
  totalComponents: number;
  signatureUrl?: string | null; // Null toegestaan voor lege handtekening
  
  usageFunctions: UsageFunctions;

  inspectionInterval: number; // Number is veiliger dan "3 | 5" voor imports
  inspectionBasis: InspectionBasis;
  nextInspectionDate: string;
}

// 10. DE STORE STATE (Global State)
export interface InspectionState {
  meta: InspectionMeta;
  measurements: Measurements;
  defects: Defect[];
  customInstruments: Instrument[];
  customLibrary: LibraryDefect[] | null;

  // Actions
  setMeta: (meta: Partial<InspectionMeta>) => void;
  setUsageFunction: (key: keyof UsageFunctions, value: boolean) => void;
  setMeasurements: (data: Partial<Measurements>) => void;
  
  addDefect: (defect: Defect) => void;
  updateDefect: (id: string, defect: Defect) => void;
  removeDefect: (id: string) => void;
  
  addInstrument: (instrument: Instrument) => void;
  removeInstrument: (id: string) => void;

  addCustomInstrument: (instrument: Instrument) => void;
  setCustomLibrary: (lib: LibraryDefect[] | null) => void;
  
  importState: (data: any) => void;
  mergeState: (incoming: any) => void;
  resetState: () => void;
}