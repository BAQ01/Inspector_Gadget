import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InspectionState, Defect, Instrument, BoardMeasurement } from './types';

// Hulpfunctie voor unieke IDs binnen de store
const generateId = () => Math.random().toString(36).substr(2, 9);

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
    additionalInspectors: [] as string[], // Initialisatie van de array
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

    inspectionInterval: null,
    inspectionBasis: { nta8220: true, verzekering: false },
    nextInspectionDate: '',
    locationPhotoUrl: '',
    signatureUrl: ''
  },
  measurements: {
    installationType: 'TN-S',
    mainFuse: '3x63A',
    mainsVoltage: '400 V ~ 3 fase + N',
    yearOfConstruction: '1990',
    boards: [
      {
        id: 'initial_hvk',
        name: 'HVK',
        switchboardTemp: '20',
        insulationResistance: '999',
        impedance: '0.35'
      }
    ],
    selectedInstruments: [],
    hasEnergyStorage: null,
    hasSolarSystem: null,
  },
  defects: [],
  customInstruments: [],
  customLibrary: null,
};

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

      addBoard: (board) => set((state) => ({
        measurements: {
          ...state.measurements,
          boards: [...state.measurements.boards, { ...board, id: board.id || generateId() }]
        }
      })),

      updateBoard: (id, updatedBoard) => set((state) => ({
        measurements: {
          ...state.measurements,
          boards: state.measurements.boards.map(b => b.id === id ? updatedBoard : b)
        }
      })),

      removeBoard: (id) => set((state) => ({
        measurements: {
          ...state.measurements,
          boards: state.measurements.boards.filter(b => b.id !== id)
        }
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
        meta: { ...initialState.meta, ...(data.meta || {}) },
        measurements: { ...initialState.measurements, ...(data.measurements || {}) },
        defects: data.defects || [],
        customInstruments: data.customInstruments || [],
        customLibrary: data.customLibrary || null,
      })),

      mergeState: (incoming) => set((state) => {
        const currentMeta = state.meta;
        const currentMeasurements = state.measurements;

        // 1. Defects mergen
        const incomingDefects = incoming.defects || [];
        const existingDefectIds = new Set(state.defects.map(d => d.id));
        const newDefects = incomingDefects.filter((d: Defect) => !existingDefectIds.has(d.id));
        
        // 2. Instrumenten mergen
        const incomingInstruments = incoming.measurements?.selectedInstruments || [];
        const existingInstIds = new Set(currentMeasurements.selectedInstruments.map(i => i.id));
        const newInstruments = incomingInstruments.filter((i: Instrument) => !existingInstIds.has(i.id));

        // 3. Boards mergen
        const incomingBoards = incoming.measurements?.boards || [];
        const existingBoardIds = new Set(currentMeasurements.boards.map(b => b.id));
        const newBoards = incomingBoards.filter((b: BoardMeasurement) => !existingBoardIds.has(b.id));

        // 4. Namen van inspecteurs verzamelen
        const contribName = incoming.meta?.inspectorName;
        let updatedAdditionalInspectors = [...(currentMeta.additionalInspectors || [])];
        
        if (contribName && contribName !== currentMeta.inspectorName && !updatedAdditionalInspectors.includes(contribName)) {
            updatedAdditionalInspectors.push(contribName);
        }

        return {
          meta: {
            ...currentMeta,
            additionalInspectors: updatedAdditionalInspectors
          },
          defects: [...state.defects, ...newDefects],
          measurements: {
            ...currentMeasurements,
            selectedInstruments: [...currentMeasurements.selectedInstruments, ...newInstruments],
            boards: [...currentMeasurements.boards, ...newBoards]
          }
        };
      }),

      resetState: () => set(() => initialState),
    }),
    {
      name: 'inspection-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);