// src/types.ts

// 1. CLASSIFICATIE
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

// 3. BEDRIJVEN & INSPECTEURS
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

export interface BoardMeasurement {
  id: string;
  name: string;             
  switchboardTemp: string;  
  insulationResistance: string; 
  impedance: string;        
}

// 6. METINGEN
export interface Measurements {
  installationType: 'TT' | 'TN-S' | 'TN-C-S' | string;
  mainFuse: string;
  mainsVoltage: string;
  yearOfConstruction: string;
  boards: BoardMeasurement[]; 
  selectedInstruments: Instrument[];
  hasEnergyStorage: boolean | null;
  hasSolarSystem: boolean | null;
}

// Alias voor compatibiliteit
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

// 8. INSPECTIE BASIS
export interface InspectionBasis {
  nta8220: boolean;
  verzekering: boolean;
}

// 9. METADATA (Hier stonden waarschijnlijk de rode kringels)
export interface InspectionMeta {
  // Klant
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientContactPerson: string;
  clientPhone: string;
  clientEmail: string;

  // Cloud & Identificatie (NIEUWE VELDEN)
  supabaseId?: number;
  inspectionNumber?: string; // Het unieke ID (bijv. IP10260204-1)
  scopeType?: string;        // Bijv. '10'
  
  // Samenwerking (NIEUWE VELDEN)
  isContributionMode?: boolean; 
  parentInspectionId?: number | string;  
  parentInspectionNumber?: string; // Toegevoegd om rode kringels in InspectorApp te voorkomen

  // Project
  projectLocation: string;
  projectAddress: string;
  projectPostalCode: string;
  projectCity: string;
  projectContactPerson: string;
  projectPhone: string;
  projectEmail: string;
  installationResponsible: string;
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
  additionalInspectors: string[];
  
  // Datums
  date: string; 
  finalizedDate?: string | null; // NIEUW: Datum van afronding

  sciosRegistrationNumber: string;
  sciosScope?: 'Scope 10'; 
  
  totalComponents: number;
  signatureUrl?: string | null;
  
  usageFunctions: UsageFunctions;

  inspectionInterval: number | null; 
  inspectionBasis: InspectionBasis;
  nextInspectionDate: string;
}

// 10. DATABASE RIJ (Voor Admin Dashboard ondersteuning)
export interface InspectionDbRow {
  id: number;
  created_at: string;
  client_name: string;
  status: string;
  inspection_number?: string; 
  scope_type?: string;        
  report_data: {
    meta: InspectionMeta;
    measurements: Measurements;
    defects: Defect[];
    customInstruments?: Instrument[];
  };
}

// 11. DE STORE STATE
export interface InspectionState {
  meta: InspectionMeta;
  measurements: Measurements;
  defects: Defect[];
  customInstruments: Instrument[];
  customLibrary: LibraryDefect[] | null;

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

  addBoard: (board: BoardMeasurement) => void;
  removeBoard: (id: string) => void;
  updateBoard: (id: string, board: BoardMeasurement) => void;
}