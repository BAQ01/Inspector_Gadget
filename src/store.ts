// src/store.ts
import { create } from 'zustand';
import { InspectionState, Defect, Instrument } from './types';

const initialState = {
  meta: {
    clientName: '',
    clientAddress: '',
    clientPostalCode: '',
    clientCity: '',
    clientContactPerson: '',
    clientPhone: '',
    clientEmail: '',
    
    projectLocation: '',
    projectAddress: '',
    projectPostalCode: '',
    projectCity: '',
    projectContactPerson: '',
    projectPhone: '',
    projectEmail: '',
    installationResponsible: '',
    idBagviewer: '',
    
    inspectionCompany: '',
    inspectionCompanyAddress: '',
    inspectionCompanyPostalCode: '',
    inspectionCompanyCity: '',
    inspectionCompanyPhone: '',
    inspectionCompanyEmail: '',
    inspectorName: '',
    date: new Date().toISOString().split('T')[0],
    sciosRegistrationNumber: '',
    
    totalComponents: 0,
    
    usageFunctions: {
      woonfunctie: false,
      bijeenkomstfunctie: false,
      celfunctie: false,
      gezondheidszorgfunctie: false,
      industriefunctie: false,
      kantoorfunctie: false,
      logiesfunctie: false,
      onderwijsfunctie: false,
      sportfunctie: false,
      winkelfunctie: false,
      overigeGebruiksfunctie: false,
      bouwwerkGeenGebouw: false,
    },

    inspectionInterval: 5 as 3 | 5,
    inspectionBasis: { nta8220: true, verzekering: false },
    nextInspectionDate: '',
  },
  measurements: {
    installationType: 'TN-S' as const,
    mainFuse: '',
    yearOfConstruction: '',
    insulationResistance: '',
    impedance: '',
    switchboardTemp: '',
    selectedInstruments: [],
    hasEnergyStorage: null,
    hasSolarSystem: null,
  },
  defects: [],
  customInstruments: [],
  customLibrary: null,
};

export const useInspectionStore = create<InspectionState>((set) => ({
  ...initialState,

  setMeta: (newMeta) => set((state) => ({ 
    meta: { ...state.meta, ...newMeta } 
  })),

  setUsageFunction: (key, value) => set((state) => ({
    meta: {
      ...state.meta,
      usageFunctions: { ...state.meta.usageFunctions, [key]: value }
    }
  })),

  setMeasurements: (data) => set((state) => ({
    measurements: { ...state.measurements, ...data }
  })),

  addDefect: (defect) => set((state) => ({ 
    defects: [...state.defects, defect] 
  })),

  updateDefect: (id, updatedDefect) => set((state) => ({
    defects: state.defects.map(d => d.id === id ? updatedDefect : d)
  })),

  removeDefect: (id) => set((state) => ({
    defects: state.defects.filter(d => d.id !== id)
  })),

  addInstrument: (instrument) => set((state) => {
    if (state.measurements.selectedInstruments.some(i => i.id === instrument.id)) return state;
    return {
      measurements: {
        ...state.measurements,
        selectedInstruments: [...state.measurements.selectedInstruments, instrument]
      }
    };
  }),

  removeInstrument: (id) => set((state) => ({
    measurements: {
      ...state.measurements,
      selectedInstruments: state.measurements.selectedInstruments.filter(i => i.id !== id)
    }
  })),

  addCustomInstrument: (inst) => set((state) => ({
    customInstruments: [...state.customInstruments, inst]
  })),

  setCustomLibrary: (lib) => set(() => ({
    customLibrary: lib
  })),

  importState: (data) => set(() => ({
    meta: data.meta || initialState.meta,
    measurements: data.measurements || initialState.measurements,
    defects: data.defects || [],
    customInstruments: data.customInstruments || [],
    customLibrary: data.customLibrary || null,
  })),

  // --- HIER IS DE MAGIE VOOR HET SAMENVOEGEN ---
  mergeState: (incoming) => set((state) => {
    // 1. Gebreken samenvoegen (filter dubbele ID's eruit)
    const incomingDefects = incoming.defects || [];
    const existingDefectIds = new Set(state.defects.map(d => d.id));
    const newDefects = incomingDefects.filter((d: Defect) => !existingDefectIds.has(d.id));
    
    // 2. Instrumenten samenvoegen (geen dubbele)
    const incomingInstruments = incoming.measurements?.selectedInstruments || [];
    const existingInstIds = new Set(state.measurements.selectedInstruments.map(i => i.id));
    const newInstruments = incomingInstruments.filter((i: Instrument) => !existingInstIds.has(i.id));

    return {
      // We behouden de meta van de "Lead" inspecteur, maar voegen gebreken toe
      defects: [...state.defects, ...newDefects],
      measurements: {
        ...state.measurements,
        selectedInstruments: [...state.measurements.selectedInstruments, ...newInstruments]
      }
    };
  }),

  resetState: () => set(() => initialState),
}));