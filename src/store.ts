import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InspectionState, InspectionMeta, MeasurementData, LibraryDefect } from './types';

// 1. De lege beginstand voor Meta (Klantgegevens)
const initialMeta: InspectionMeta = {
  clientName: '', clientAddress: '', clientPostalCode: '', clientCity: '', clientContactPerson: '', clientPhone: '', clientEmail: '',
  projectLocation: '', projectAddress: '', projectPostalCode: '', projectCity: '', projectContactPerson: '', projectPhone: '', projectEmail: '',
  installationResponsible: '', idBagviewer: '',
  inspectionCompany: '', inspectionCompanyAddress: '', inspectionCompanyPostalCode: '', inspectionCompanyCity: '', inspectionCompanyPhone: '', inspectionCompanyEmail: '',
  inspectorName: '', sciosRegistrationNumber: '',
  date: new Date().toISOString().split('T')[0],
  totalComponents: 0,
  usageFunctions: { 
    woonfunctie: false, bijeenkomstfunctie: false, celfunctie: false, gezondheidszorgfunctie: false, 
    industriefunctie: false, kantoorfunctie: false, logiesfunctie: false, onderwijsfunctie: false, 
    sportfunctie: false, winkelfunctie: false, overigeGebruiksfunctie: false, bouwwerkGeenGebouw: false 
  },
  inspectionInterval: 5, 
  inspectionBasis: { nta8220: true, verzekering: false }, 
  nextInspectionDate: '',
  signatureUrl: '',      
  locationPhotoUrl: ''   
};

// 2. De lege beginstand voor Metingen
const initialMeasurements: MeasurementData = {
  installationType: 'TN-S', 
  mainFuse: '3x25A', 
  yearOfConstruction: '', 
  insulationResistance: '', 
  impedance: '', 
  switchboardTemp: '', 
  selectedInstruments: [], 
  hasEnergyStorage: null, 
  hasSolarSystem: null
};

// 3. De Store definitie
interface ExtendedInspectionState extends InspectionState {
  customLibrary: LibraryDefect[] | null;
  setCustomLibrary: (lib: LibraryDefect[] | null) => void;
}

export const useInspectionStore = create<ExtendedInspectionState>()(
  persist(
    (set) => ({
      meta: initialMeta,
      measurements: initialMeasurements,
      defects: [],
      customInstruments: [],
      customLibrary: null,

      // --- Setters & Updates ---
      setMeta: (newMeta) => set((state) => ({ meta: { ...state.meta, ...newMeta } })),
      
      setUsageFunction: (key, value) => set((state) => ({ 
        meta: { ...state.meta, usageFunctions: { ...state.meta.usageFunctions, [key]: value } } 
      })),
      
      setMeasurements: (data) => set((state) => ({ measurements: { ...state.measurements, ...data } })),
      
      addDefect: (defect) => set((state) => ({ defects: [...state.defects, defect] })),
      updateDefect: (id, defect) => set((state) => ({ defects: state.defects.map((d) => (d.id === id ? defect : d)) })),
      removeDefect: (id) => set((state) => ({ defects: state.defects.filter((d) => d.id !== id) })),
      
      addInstrument: (inst) => set((state) => {
        if (state.measurements.selectedInstruments.find(i => i.id === inst.id)) return state;
        return { measurements: { ...state.measurements, selectedInstruments: [...state.measurements.selectedInstruments, inst] } };
      }),
      
      removeInstrument: (id) => set((state) => ({ 
        measurements: { ...state.measurements, selectedInstruments: state.measurements.selectedInstruments.filter((i) => i.id !== id) } 
      })),
      
      addCustomInstrument: (inst) => set((state) => ({ customInstruments: [...state.customInstruments, inst] })),

      setCustomLibrary: (lib) => set({ customLibrary: lib }),

      // --- Import & Reset ---
      importState: (data) => set((state) => ({
        meta: { ...initialMeta, ...data.meta },
        measurements: { ...initialMeasurements, ...data.measurements },
        defects: data.defects || [],
        customInstruments: data.customInstruments || state.customInstruments, 
      })),

      // Reset: Wist ALLEEN de klantgegevens. Behoudt je eigen instrumenten en bibliotheek!
      resetState: () => set((state) => ({ 
        meta: initialMeta, 
        measurements: initialMeasurements, 
        defects: [],
      })), 
    }),
    {
      name: 'inspection-gadget-storage', 
      partialize: (state) => ({
        meta: state.meta,
        measurements: state.measurements,
        defects: state.defects,
        customInstruments: state.customInstruments,
        customLibrary: state.customLibrary
      })
    }
  )
);