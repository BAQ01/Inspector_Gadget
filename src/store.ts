import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // <--- NIEUW
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
    locationPhotoUrl: '',
    signatureUrl: ''
  },
measurements: {
    installationType: 'TN-S' as const,
    mainFuse: '3x63A', // Standaardwaarde (voorkomt dat het lege tekstveld verschijnt)
    mainsVoltage: '400 V ~ 3 fase + N', // Standaardwaarde
    yearOfConstruction: '1990', // Standaard schatting
    insulationResistance: '999', // >999 MOhm is vaak de max weergave (is goed)
    impedance: '0.35', // Realistische waarde voor Zi
    switchboardTemp: '20', // Standaard omgevingstemperatuur
    selectedInstruments: [],
    hasEnergyStorage: null,
    hasSolarSystem: null,
  },
  defects: [],
  customInstruments: [],
  customLibrary: null,
};

// We gebruiken 'persist' om alles automatisch op te slaan
export const useInspectionStore = create<InspectionState>()(
  persist(
    (set) => ({
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

      mergeState: (incoming) => set((state) => {
        const incomingDefects = incoming.defects || [];
        const existingDefectIds = new Set(state.defects.map(d => d.id));
        const newDefects = incomingDefects.filter((d: Defect) => !existingDefectIds.has(d.id));
        
        const incomingInstruments = incoming.measurements?.selectedInstruments || [];
        const existingInstIds = new Set(state.measurements.selectedInstruments.map(i => i.id));
        const newInstruments = incomingInstruments.filter((i: Instrument) => !existingInstIds.has(i.id));

        return {
          defects: [...state.defects, ...newDefects],
          measurements: {
            ...state.measurements,
            selectedInstruments: [...state.measurements.selectedInstruments, ...newInstruments]
          }
        };
      }),

      resetState: () => set(() => initialState),
    }),
    {
      name: 'inspection-storage', // De unieke naam in LocalStorage
      storage: createJSONStorage(() => localStorage), // We slaan op in de browser
    }
  )
);