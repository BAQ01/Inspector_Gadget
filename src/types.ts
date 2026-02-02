// src/types.ts

export type Classification = 'Red' | 'Orange' | 'Yellow' | 'Blue';

export interface LibraryDefect {
  id: string;
  category: string;
  subcategory: string;
  shortName: string;
  description: string;
  classification: Classification;
  action: string;
}

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

export interface Defect {
  id: string;
  libraryId?: string;
  location: string;
  description: string;
  classification: Classification;
  action: string;
  photoUrl?: string;
  photoUrl2?: string;
}

export interface Instrument {
  id: string;
  name: string;
  serialNumber: string;
  calibrationDate: string;
}

export interface MeasurementData {
  installationType: 'TT' | 'TN-S' | 'TN-C-S';
  mainFuse: string;
  mainsVoltage: string; // <--- NIEUW: Netspanning veld
  yearOfConstruction: string;
  insulationResistance: string;
  impedance: string;
  switchboardTemp: string;
  selectedInstruments: Instrument[];
  hasEnergyStorage: boolean | null;
  hasSolarSystem: boolean | null;
}

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

export interface InspectionBasis {
  nta8220: boolean;
  verzekering: boolean;
}

export interface InspectionMeta {
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientContactPerson: string;
  clientPhone: string;
  clientEmail: string;

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
  signatureUrl?: string;
  
  usageFunctions: UsageFunctions;

  inspectionInterval: 3 | 5;
  inspectionBasis: InspectionBasis;
  nextInspectionDate: string;
}

export interface InspectionState {
  meta: InspectionMeta;
  measurements: MeasurementData;
  defects: Defect[];
  customInstruments: Instrument[];
  customLibrary: LibraryDefect[] | null; // Toegevoegd voor CSV import

  setMeta: (meta: Partial<InspectionMeta>) => void;
  setUsageFunction: (key: keyof UsageFunctions, value: boolean) => void;
  setMeasurements: (data: Partial<MeasurementData>) => void;
  
  addDefect: (defect: Defect) => void;
  updateDefect: (id: string, defect: Defect) => void;
  removeDefect: (id: string) => void;
  
  addInstrument: (instrument: Instrument) => void;
  removeInstrument: (id: string) => void;

  addCustomInstrument: (instrument: Instrument) => void;
  setCustomLibrary: (lib: LibraryDefect[] | null) => void; // Toegevoegd voor CSV import
  
  importState: (data: any) => void;
  mergeState: (incoming: any) => void; // <--- HIER DE NIEUWE MERGE FUNCTIE
  resetState: () => void;
}