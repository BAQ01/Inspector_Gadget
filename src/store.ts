import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// AANGEPAST: Ongebruikte imports (Defect, Instrument, UsageFunctions) verwijderd
import { InspectionState, InspectionMeta, MeasurementData, LibraryDefect } from './types';

const initialMeta: InspectionMeta = {
  clientName: '', clientAddress: '', clientPostalCode: '', clientCity: '', clientContactPerson: '', clientPhone: '', clientEmail: '',
  projectLocation: '', projectAddress: '', projectPostalCode: '', projectCity: '', projectContactPerson: '', projectPhone: '', projectEmail: '',
  installationResponsible: '', idBagviewer: '', inspectionCompany: '', inspectionCompanyAddress: '', inspectionCompanyPostalCode: '',
  inspectionCompanyCity: '', inspectionCompanyPhone: '', inspectionCompanyEmail: '', inspectorName: '', date: new Date().toISOString().split('T')[0],
  sciosRegistrationNumber: '', totalComponents: 0,
  usageFunctions: { woonfunctie: false, bijeenkomstfunctie: false, celfunctie: false, gezondheidszorgfunctie: false, industriefunctie: false, kantoorfunctie: false, logiesfunctie: false, onderwijsfunctie: false, sportfunctie: false, winkelfunctie: false, overigeGebruiksfunctie: false, bouwwerkGeenGebouw: false },
  inspectionInterval: 5, inspectionBasis: { nta8220: true, verzekering: false }, nextInspectionDate: ''
};

const initialMeasurements: MeasurementData = {
  installationType: 'TN-S', mainFuse: '3x25A', yearOfConstruction: '', insulationResistance: '', impedance: '', switchboardTemp: '', selectedInstruments: [], hasEnergyStorage: null, hasSolarSystem: null
};

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

      setMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta } })),
      setUsageFunction: (key, value) => set((state) => ({ meta: { ...state.meta, usageFunctions: { ...state.meta.usageFunctions, [key]: value } } })),
      setMeasurements: (data) => set((state) => ({ measurements: { ...state.measurements, ...data } })),
      
      addDefect: (defect) => set((state) => ({ defects: [...state.defects, defect] })),
      updateDefect: (id, defect) => set((state) => ({ defects: state.defects.map((d) => (d.id === id ? defect : d)) })),
      removeDefect: (id) => set((state) => ({ defects: state.defects.filter((d) => d.id !== id) })),
      
      addInstrument: (inst) => set((state) => ({ measurements: { ...state.measurements, selectedInstruments: [...state.measurements.selectedInstruments, inst] } })),
      removeInstrument: (id) => set((state) => ({ measurements: { ...state.measurements, selectedInstruments: state.measurements.selectedInstruments.filter((i) => i.id !== id) } })),
      addCustomInstrument: (inst) => set((state) => ({ customInstruments: [...state.customInstruments, inst] })),

      setCustomLibrary: (lib) => set({ customLibrary: lib }),

      importState: (data) => set({ ...data }),
      resetState: () => set({ meta: initialMeta, measurements: initialMeasurements, defects: [], customInstruments: [] }), 
    }),
    {
      name: 'inspection-storage',
    }
  )
);