import React, { useState, useRef, useEffect } from 'react';
import { useInspectionStore } from './store';
import { DEFECT_LIBRARY, calculateSample, INSTRUMENTS, COMPANIES, INSPECTORS } from './constants';
import { pdf } from '@react-pdf/renderer'; 
import { PDFReport } from './components/PDFReport';
import { compressImage } from './utils';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, Trash2, ChevronLeft, ChevronRight, PlusCircle, X, CheckSquare, Pencil, Upload, RotateCcw, Calendar, Download, Search, MapPin, AlertTriangle, Info, FileText, RefreshCw, Share2 } from 'lucide-react';
import { UsageFunctions, Defect, Classification, LibraryDefect } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);
const FUSE_OPTIONS = ['3x25A', '3x63A', '3x80A'];
const STEPS = ['setup', 'measure', 'inspect', 'report'] as const;

// --- FUNCTIE 1: Safari-veilige datum berekening ---
const addYearsSafe = (dateString: string, yearsToAdd: number) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parts[1];
  const day = parts[2];
  const newYear = year + yearsToAdd;
  return `${newYear}-${month}-${day}`;
};

// --- FUNCTIE 2: Slimme CSV Parser ---
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    }
    else if (char === ';' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    }
    else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
         rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      if (char === '\r') i++;
    }
    else {
        if (char !== '\r') currentCell += char;
    }
  }
  
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  
  return rows;
};

export default function App() {
  const { meta, defects, measurements, customInstruments, customLibrary, setMeta, setUsageFunction, setMeasurements, addDefect, updateDefect, removeDefect, addInstrument, removeInstrument, addCustomInstrument, importState, mergeState, resetState, setCustomLibrary } = useInspectionStore();
  const [activeTab, setActiveTab] = useState<typeof STEPS[number]>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const ALL_INSTRUMENTS = [...INSTRUMENTS, ...customInstruments];
  const ACTIVE_LIBRARY = customLibrary && customLibrary.length > 0 ? customLibrary : DEFECT_LIBRARY;

  // --- STATES ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [defectPhoto1, setDefectPhoto1] = useState<string | null>(null);
  const [defectPhoto2, setDefectPhoto2] = useState<string | null>(null);

  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedLibId, setSelectedLibId] = useState('');
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCustomDefect, setIsCustomDefect] = useState(false);
  
  const [staticDescription, setStaticDescription] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [customClassification, setCustomClassification] = useState<Classification>('Yellow');
  const [customAction, setCustomAction] = useState('');

  const [showNewInstrumentForm, setShowNewInstrumentForm] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstSn, setNewInstSn] = useState('');
  const [newInstDate, setNewInstDate] = useState('');
  const [isSearchingBag, setIsSearchingBag] = useState(false);

  const sigPad = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const isCustomFuse = !FUSE_OPTIONS.includes(measurements.mainFuse) && measurements.mainFuse !== '';
  const currentStepIndex = STEPS.indexOf(activeTab);

  useEffect(() => {
    if (meta.date && meta.inspectionInterval) {
      const nextDate = addYearsSafe(meta.date, meta.inspectionInterval);
      setMeta({ nextInspectionDate: nextDate });
    }
  }, [meta.date, meta.inspectionInterval, setMeta]);
  
  const goNext = () => { if (currentStepIndex < STEPS.length - 1) { setActiveTab(STEPS[currentStepIndex + 1]); window.scrollTo(0, 0); }};
  const goPrev = () => { if (currentStepIndex > 0) { setActiveTab(STEPS[currentStepIndex - 1]); window.scrollTo(0, 0); }};

  const mainCategories = Array.from(new Set(ACTIVE_LIBRARY.map(d => d.category))).sort();
  
  const subCategories = selectedMainCategory 
    ? Array.from(new Set(ACTIVE_LIBRARY.filter(d => d.category === selectedMainCategory).map(d => d.subcategory))).sort()
    : [];

  const filteredDefects = (selectedMainCategory && selectedSubCategory)
    ? ACTIVE_LIBRARY.filter(d => d.category === selectedMainCategory && d.subcategory === selectedSubCategory)
    : [];

  // --- CSV IMPORT LOGICA ---
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const newLib: LibraryDefect[] = [];
      let idCounter = 1;

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length >= 4) { 
            const cat = cols[0];
            const sub = cols[1];
            const short = cols[2];
            const desc = cols[3];
            const cl = (cols[4] || 'Yellow') as Classification; 
            const act = cols[5] || 'Herstellen';

            if (cat && desc) {
                newLib.push({
                    id: `cust_${idCounter++}`,
                    category: cat,
                    subcategory: sub || 'Algemeen',
                    shortName: short || desc.substring(0, 20) + '...',
                    description: desc,
                    classification: ['Red', 'Orange', 'Yellow', 'Blue'].includes(cl) ? cl : 'Yellow',
                    action: act
                });
            }
        }
      }

      if (newLib.length > 0) {
          setCustomLibrary(newLib);
          alert(`Succes! ${newLib.length} items geïmporteerd.`);
      } else {
          alert("Geen geldige items gevonden.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetLibrary = () => {
      if (window.confirm("Wil je terug naar de standaard bibliotheek?")) {
          setCustomLibrary(null);
      }
  };

  // --- SAMENVOEGEN LOGICA ---
  const handleMergeClick = () => {
    if (window.confirm('Wil je gebreken van een collega toevoegen aan dit rapport?')) {
        mergeInputRef.current?.click();
    }
  };

  const handleMergeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        mergeState(json);
        alert(`Succes! ${json.defects.length} gebreken van collega toegevoegd.`);
      } catch (e) {
        alert('Fout bij samenvoegen bestand. Is dit een geldig exportbestand?');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMainCategoryChange = (val: string) => {
    if (val === 'NEW') { setIsCreatingCategory(true); setSelectedMainCategory(''); } else { setIsCreatingCategory(false); setSelectedMainCategory(val); }
    setSelectedSubCategory(''); setSelectedLibId(''); setIsCustomDefect(false); setStaticDescription('');
  };

  const handleSubCategoryChange = (val: string) => {
    setSelectedSubCategory(val); setSelectedLibId(''); setIsCustomDefect(false); setStaticDescription('');
  };

  const handleDefectChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomDefect(true); setSelectedLibId(''); setStaticDescription(''); setCustomComment(''); setCustomAction(''); setCustomClassification('Yellow');
    } else {
      setIsCustomDefect(false); setSelectedLibId(val);
      const libItem = ACTIVE_LIBRARY.find(d => d.id === val);
      if (libItem) { setStaticDescription(libItem.description); setCustomClassification(libItem.classification); setCustomAction(libItem.action); }
      setCustomComment(''); 
    }
  };

  const handleStartEdit = (d: Defect) => {
    setLocation(d.location); setDefectPhoto1(d.photoUrl || null); setDefectPhoto2(d.photoUrl2 || null);
    const libItem = ACTIVE_LIBRARY.find(l => l.id === d.libraryId);
    if (libItem) {
        setIsCreatingCategory(false); setIsCustomDefect(false); setSelectedMainCategory(libItem.category); setSelectedSubCategory(libItem.subcategory); setSelectedLibId(libItem.id); setStaticDescription(libItem.description); setCustomClassification(libItem.classification); setCustomAction(libItem.action);
        if (d.description.startsWith(libItem.description)) { const extra = d.description.replace(libItem.description, '').trim(); setCustomComment(extra.replace(/^\n+/, '')); } else { setCustomComment(''); }
    } else {
        setIsCustomDefect(true); setSelectedMainCategory(''); setSelectedSubCategory(''); setStaticDescription(''); setCustomComment(d.description); setCustomClassification(d.classification); setCustomAction(d.action);
    }
    setEditingId(d.id); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDefect = () => {
    if (!location) return;
    let finalDescription = '', finalClassification: Classification = 'Yellow', finalAction = '', finalLibId: string | undefined = undefined;
    if (isCustomDefect) { finalDescription = customComment; finalClassification = customClassification; finalAction = customAction; } 
    else { const libItem = ACTIVE_LIBRARY.find(d => d.id === selectedLibId); if (!libItem) return; finalDescription = customComment ? `${libItem.description}\n\n${customComment}` : libItem.description; finalClassification = libItem.classification; finalAction = libItem.action; finalLibId = libItem.id; }
    const defectData: Defect = { id: editingId || generateId(), libraryId: finalLibId, location, description: finalDescription, classification: finalClassification, action: finalAction, photoUrl: defectPhoto1 || undefined, photoUrl2: defectPhoto2 || undefined };
    if (editingId) { updateDefect(editingId, defectData); setEditingId(null); } else { addDefect(defectData); }
    setLocation(''); setCustomComment(''); setStaticDescription(''); setSelectedLibId(''); setDefectPhoto1(null); setDefectPhoto2(null); if (isCustomDefect) { setIsCustomDefect(false); setCustomAction(''); setCustomClassification('Yellow'); }
  };

  const handleCancelEdit = () => { setEditingId(null); setLocation(''); setSelectedLibId(''); setCustomComment(''); setStaticDescription(''); setDefectPhoto1(null); setDefectPhoto2(null); setIsCustomDefect(false); };
  const handleBagSearch = async () => { if (!meta.projectPostalCode || !meta.projectAddress) { alert("Vul adres in."); return; } setIsSearchingBag(true); try { const q = `${meta.projectPostalCode} ${(meta.projectAddress.match(/\d+/) || [''])[0]}`.trim(); const res = await fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&rows=1`); const d = await res.json(); if (d.response.docs[0]) { setMeta({ idBagviewer: d.response.docs[0].adresseerbaarobject_id || d.response.docs[0].id, projectCity: d.response.docs[0].woonplaatsnaam || meta.projectCity }); } else alert("Niet gevonden."); } catch { alert("Fout."); } finally { setIsSearchingBag(false); } };
  const handlePhotoUpload = async (file: File) => await compressImage(file, 'defect');
  const handleLocationPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { const res = await compressImage(e.target.files[0], 'cover'); setMeta({ locationPhotoUrl: res }); e.target.value = ''; } };
  const onDefectPhoto = async (e: React.ChangeEvent<HTMLInputElement>, num: 1 | 2) => { if (e.target.files?.[0]) { const res = await handlePhotoUpload(e.target.files[0]); if (num === 1) setDefectPhoto1(res); else setDefectPhoto2(res); e.target.value = ''; } };
  
  // --- DOWNLOAD FUNCTIE (BACKUP) ---
  // Slaat direct op, geen share menu.
  const handleBackupDownload = () => { 
      const fileName = `Backup_${meta.clientName || 'Klant'}_${meta.date}.json`;
      const data = JSON.stringify({ meta, measurements, defects, customInstruments, exportDate: new Date().toISOString() }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = fileName; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a); 
      URL.revokeObjectURL(url); 
  };

  // --- DELEN FUNCTIE (SHARE) ---
  // Probeert het bestand te delen via AirDrop/Mail
  const handleShareFindings = async () => {
      const fileName = `Deelbestand_${meta.projectLocation || 'Project'}_${meta.inspectorName || 'Inspecteur'}.json`;
      const data = JSON.stringify({ meta, measurements, defects, customInstruments, exportDate: new Date().toISOString() }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
              await navigator.share({
                  files: [file],
                  title: 'Inspectie Bevindingen',
                  text: 'Hier zijn mijn bevindingen voor samenvoeging.'
              });
          } catch (e) {
              console.log('Delen geannuleerd of mislukt', e);
          }
      } else {
          // Fallback als delen niet kan: gewoon downloaden
          alert("Delen niet ondersteund op dit apparaat, bestand wordt gedownload.");
          const url = URL.createObjectURL(blob); 
          const a = document.createElement('a'); 
          a.href = url; 
          a.download = fileName; 
          document.body.appendChild(a); 
          a.click(); 
          document.body.removeChild(a); 
          URL.revokeObjectURL(url); 
      }
  };

  const handleImportClick = () => { if (window.confirm('Overschrijven?')) fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { importState(JSON.parse(ev.target?.result as string)); alert('Geladen!'); } catch { alert('Fout'); } }; r.readAsText(f); e.target.value = ''; };
  const handleReset = () => { if (window.confirm('Alles wissen?')) { resetState(); setEditingId(null); setLocation(''); setSelectedLibId(''); setSelectedMainCategory(''); setSelectedSubCategory(''); setCustomComment(''); setStaticDescription(''); setDefectPhoto1(null); setDefectPhoto2(null); if (sigPad.current) sigPad.current.clear(); window.scrollTo(0, 0); } };
  const saveSignature = () => { if (sigPad.current) setMeta({ signatureUrl: sigPad.current.getCanvas().toDataURL('image/png') }); };
  const clearSignature = () => { sigPad.current?.clear(); setMeta({ signatureUrl: '' }); };
  const sampleSize = calculateSample(meta.totalComponents);
  const usageOptionsLeft: {key: keyof UsageFunctions, label: string}[] = [{ key: 'woonfunctie', label: 'Woonfunctie' }, { key: 'bijeenkomstfunctie', label: 'Bijeenkomstfunctie' }, { key: 'celfunctie', label: 'Celfunctie' }, { key: 'gezondheidszorgfunctie', label: 'Gezondheidszorgfunctie' }, { key: 'industriefunctie', label: 'Industriefunctie' }, { key: 'kantoorfunctie', label: 'Kantoorfunctie' }];
  const usageOptionsRight: {key: keyof UsageFunctions, label: string}[] = [{ key: 'logiesfunctie', label: 'Logiesfunctie' }, { key: 'onderwijsfunctie', label: 'Onderwijsfunctie' }, { key: 'sportfunctie', label: 'Sportfunctie' }, { key: 'winkelfunctie', label: 'Winkelfunctie' }, { key: 'overigeGebruiksfunctie', label: 'Overige gebruiksfunctie' }, { key: 'bouwwerkGeenGebouw', label: 'Bouwwerk geen gebouw zijnde' }];

  // --- PDF DOWNLOAD FUNCTIE ---
  const handleDownloadPDF = async () => {
    if (!meta.signatureUrl) {
      alert("Let op: Je hebt nog niet getekend.");
      return;
    }

    setIsGenerating(true);
    const fileName = `Scope10_${meta.clientName || 'Klant'}_${meta.date}.pdf`;

    try {
      const blob = await pdf(<PDFReport meta={meta} defects={defects} measurements={measurements} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
    } catch (e) {
      console.error(e);
      alert("Er ging iets mis bij het genereren.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-xl min-h-screen md:min-h-0 md:rounded-lg md:my-8 overflow-hidden flex flex-col">
        <div className="bg-emerald-700 p-4 text-white flex justify-between items-center shadow-md"><h1 className="font-bold text-xl">SCIOS Scope 10</h1><div className="text-xs font-mono bg-emerald-900/50 px-3 py-1 rounded">{meta.date}</div></div>
        <div className="flex border-b overflow-x-auto bg-white">{STEPS.map((tab, i) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 p-3 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-emerald-700 border-b-4 border-emerald-700 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}>{i + 1}. {tab === 'setup' ? 'Basis' : tab === 'measure' ? 'Metingen' : tab === 'inspect' ? 'Gebreken' : 'Export'}</button>))}</div>

        <div className="p-6 flex-grow">
          {activeTab === 'setup' && (
            <div className="space-y-6">
               <div className="flex gap-2 mb-4">
                 <button onClick={handleImportClick} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><Upload size={16} /><span className="hidden md:inline">Laden</span></button>
                 
                 <button onClick={handleMergeClick} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><PlusCircle size={16} /><span className="hidden md:inline">Samenvoegen</span></button>
                 
                 <button onClick={handleBackupDownload} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><Download size={16} /><span className="hidden md:inline">Backup Opslaan</span></button>
                 <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><RotateCcw size={16} /><span className="hidden md:inline">Leegmaken</span></button>
                 
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                 <input type="file" ref={mergeInputRef} onChange={handleMergeFile} accept=".json" className="hidden" />
               </div>

               <div className="bg-gray-50 p-4 rounded border"><h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Opdrachtgever</h2><div className="grid grid-cols-1 gap-3"><input className="border rounded p-2" placeholder="Naam" value={meta.clientName} onChange={(e) => setMeta({ clientName: e.target.value })} /><input className="border rounded p-2" placeholder="Adres" value={meta.clientAddress} onChange={(e) => setMeta({ clientAddress: e.target.value })} /><div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.clientPostalCode} onChange={(e) => setMeta({ clientPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.clientCity} onChange={(e) => setMeta({ clientCity: e.target.value })} /></div><input className="border rounded p-2" placeholder="Contact" value={meta.clientContactPerson} onChange={(e) => setMeta({ clientContactPerson: e.target.value })} /><input className="border rounded p-2" placeholder="Tel" value={meta.clientPhone} onChange={(e) => setMeta({ clientPhone: e.target.value })} /><input className="border rounded p-2" placeholder="Email" value={meta.clientEmail} onChange={(e) => setMeta({ clientEmail: e.target.value })} /></div></div>
               <div className="bg-gray-50 p-4 rounded border"><h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Projectgegevens</h2><div className="grid grid-cols-1 gap-3"><input className="border rounded p-2" placeholder="Locatie (Naam Gebouw)" value={meta.projectLocation} onChange={(e) => setMeta({ projectLocation: e.target.value })} /><input className="border rounded p-2" placeholder="Adres" value={meta.projectAddress} onChange={(e) => setMeta({ projectAddress: e.target.value })} /><div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.projectPostalCode} onChange={(e) => setMeta({ projectPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.projectCity} onChange={(e) => setMeta({ projectCity: e.target.value })} /></div><input className="border rounded p-2" placeholder="Contact" value={meta.projectContactPerson} onChange={(e) => setMeta({ projectContactPerson: e.target.value })} /><input className="border rounded p-2" placeholder="Tel" value={meta.projectPhone} onChange={(e) => setMeta({ projectPhone: e.target.value })} /><input className="border rounded p-2" placeholder="Email" value={meta.projectEmail} onChange={(e) => setMeta({ projectEmail: e.target.value })} /><input className="border rounded p-2" placeholder="IV'er" value={meta.installationResponsible} onChange={(e) => setMeta({ installationResponsible: e.target.value })} /><div className="flex gap-2 items-center"><input className="border rounded p-2 flex-grow" placeholder="ID Bagviewer" value={meta.idBagviewer} onChange={(e) => setMeta({ idBagviewer: e.target.value })} /><button onClick={handleBagSearch} disabled={isSearchingBag} className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 text-sm font-bold whitespace-nowrap">{isSearchingBag ? '...' : <><Search size={16} /> Zoek ID</>}</button></div>{meta.idBagviewer && (<a href={`https://bagviewer.kadaster.nl/lvbag/bag-viewer/?zoomlevel=1&objectId=${meta.idBagviewer}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline flex items-center gap-1"><MapPin size={12}/> Open in BAG Viewer</a>)}<div className="mt-4 border-t border-emerald-200 pt-4"><label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Foto voorblad rapport</label><div className="flex gap-4 items-center"><label className="bg-emerald-600 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 text-sm font-bold hover:bg-emerald-700 transition shadow-sm"><Camera size={18} /><span>Foto maken/kiezen</span><input type="file" accept="image/*" className="hidden" onChange={handleLocationPhoto} /></label>{meta.locationPhotoUrl && (<div className="relative group"><img src={meta.locationPhotoUrl} className="h-20 w-20 object-cover rounded-lg border-2 border-emerald-500 shadow-sm" alt="Voorblad" /><button onClick={() => setMeta({ locationPhotoUrl: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><X size={14}/></button></div>)}</div></div></div></div>
               <div className="bg-gray-50 p-4 rounded border"><h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Gebruiksfunctie</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2">{usageOptionsLeft.map(opt => (<label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded"><input type="checkbox" checked={meta.usageFunctions[opt.key]} onChange={(e) => setUsageFunction(opt.key, e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" /><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div><div className="space-y-2">{usageOptionsRight.map(opt => (<label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded"><input type="checkbox" checked={meta.usageFunctions[opt.key]} onChange={(e) => setUsageFunction(opt.key, e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" /><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div></div></div>
               <div className="bg-gray-50 p-4 rounded border"><div className="flex justify-between items-center border-b border-emerald-200 pb-2 mb-3"><h2 className="text-sm font-bold text-emerald-700 uppercase">Inspectiebedrijf</h2><select className="text-xs border rounded p-1 w-1/2" onChange={(e) => { const c = COMPANIES.find(x => x.name === e.target.value); if (c) setMeta({ inspectionCompany: c.name, inspectionCompanyAddress: c.address, inspectionCompanyPostalCode: c.postalCode, inspectionCompanyCity: c.city, inspectionCompanyPhone: c.phone, inspectionCompanyEmail: c.email }); }} defaultValue=""><option value="" disabled>-- Snelkeuze --</option>{COMPANIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div><div className="grid grid-cols-1 gap-3"><input className="border rounded p-2" placeholder="Bedrijfsnaam" value={meta.inspectionCompany} onChange={(e) => setMeta({ inspectionCompany: e.target.value })} /><input className="border rounded p-2" placeholder="Adres" value={meta.inspectionCompanyAddress} onChange={(e) => setMeta({ inspectionCompanyAddress: e.target.value })} /><div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.inspectionCompanyPostalCode} onChange={(e) => setMeta({ inspectionCompanyPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.inspectionCompanyCity} onChange={(e) => setMeta({ inspectionCompanyCity: e.target.value })} /></div><input className="border rounded p-2" placeholder="Tel" value={meta.inspectionCompanyPhone} onChange={(e) => setMeta({ inspectionCompanyPhone: e.target.value })} /><input className="border rounded p-2" placeholder="Email" value={meta.inspectionCompanyEmail} onChange={(e) => setMeta({ inspectionCompanyEmail: e.target.value })} /><div className="mt-2 pt-2 border-t"><div className="flex justify-between mb-2"><label className="text-xs font-bold text-gray-500">Inspecteur</label><select className="text-xs border rounded p-1 w-1/2" onChange={(e) => { const i = INSPECTORS.find(x => x.name === e.target.value); if (i) setMeta({ inspectorName: i.name, sciosRegistrationNumber: i.sciosNr }); }} defaultValue=""><option value="" disabled>-- Snelkeuze --</option>{INSPECTORS.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}</select></div><input className="border rounded p-2 w-full mb-2" placeholder="Inspecteur" value={meta.inspectorName} onChange={(e) => setMeta({ inspectorName: e.target.value })} /><input className="border rounded p-2 w-full" placeholder="SCIOS Nr" value={meta.sciosRegistrationNumber} onChange={(e) => setMeta({ sciosRegistrationNumber: e.target.value })} /></div><input className="border rounded p-2" type="date" value={meta.date} onChange={(e) => setMeta({ date: e.target.value })} /></div></div>
               <div className="bg-blue-50 p-4 rounded border border-blue-100"><label className="text-xs font-bold text-blue-800 uppercase">Totaal aantal componenten</label><input type="number" className="border rounded p-3 w-full mt-1" value={meta.totalComponents || ''} onChange={(e) => setMeta({ totalComponents: parseInt(e.target.value) || 0 })} />{meta.totalComponents > 0 && <p className="text-xs text-blue-600 mt-1">Steekproef: inspecteer {sampleSize} items.</p>}</div>
            </div>
          )}

          {activeTab === 'measure' && (
            <div className="space-y-4">
               <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Metingen & Beproevingen</h2>
               <div className="bg-blue-50 p-4 rounded border border-blue-100 mb-4"><label className="block text-xs font-bold text-blue-800 uppercase mb-2">Gebruikte Meetinstrumenten</label><div className="flex gap-2 mb-3"><select className="border rounded p-2 w-full" onChange={(e) => { const inst = ALL_INSTRUMENTS.find(i => i.id === e.target.value); if (inst) { addInstrument(inst); e.target.value = ""; } }} defaultValue=""><option value="" disabled>-- Selecteer --</option>{ALL_INSTRUMENTS.map(i => <option key={i.id} value={i.id}>{i.name} ({i.serialNumber})</option>)}</select><button onClick={() => setShowNewInstrumentForm(true)} className="bg-blue-600 text-white p-2 rounded whitespace-nowrap flex items-center gap-1 text-sm font-bold"><PlusCircle size={16} /> Nieuw</button></div>{showNewInstrumentForm && (<div className="bg-white p-3 rounded border border-blue-200 mb-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2"><input className="border p-1 rounded text-sm" placeholder="Naam" value={newInstName} onChange={e => setNewInstName(e.target.value)} /><input className="border p-1 rounded text-sm" placeholder="Serienummer" value={newInstSn} onChange={e => setNewInstSn(e.target.value)} /><input className="border p-1 rounded text-sm" placeholder="Datum" value={newInstDate} onChange={e => setNewInstDate(e.target.value)} /></div><button onClick={() => { if (!newInstName) return; const newInst = { id: generateId(), name: newInstName, serialNumber: newInstSn || 'N.v.t.', calibrationDate: newInstDate || 'N.v.t.' }; addCustomInstrument(newInst); addInstrument(newInst); setNewInstName(''); setNewInstSn(''); setNewInstDate(''); setShowNewInstrumentForm(false); }} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold w-full">Toevoegen en Opslaan</button></div>)}<div className="space-y-1">{measurements.selectedInstruments.map(inst => (<div key={inst.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-200 shadow-sm"><div className="flex items-center gap-2"><CheckSquare size={16} className="text-emerald-600" /><div><div className="font-bold text-sm">{inst.name}</div><div className="text-xs text-gray-500">Sn: {inst.serialNumber}</div></div></div><button onClick={() => removeInstrument(inst.id)} className="text-red-400"><X size={18} /></button></div>))}</div></div>
               <div className="bg-white p-4 rounded border border-orange-200 mb-4 shadow-sm"><h3 className="font-bold text-sm text-orange-800 border-b border-orange-200 pb-2 mb-3">Aanvullende Installaties</h3><div className="flex justify-between items-center mb-4"><span className="text-sm font-bold">Energieopslagsysteem?</span><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="energyStorage" checked={measurements.hasEnergyStorage === true} onChange={() => setMeasurements({ hasEnergyStorage: true })} /><span className="text-sm">Ja</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="energyStorage" checked={measurements.hasEnergyStorage === false} onChange={() => setMeasurements({ hasEnergyStorage: false })} /><span className="text-sm">Nee</span></label></div></div><div className="flex justify-between items-center"><span className="text-sm font-bold">Zonnestroominstallatie?</span><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="solarSystem" checked={measurements.hasSolarSystem === true} onChange={() => setMeasurements({ hasSolarSystem: true })} /><span className="text-sm">Ja</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="solarSystem" checked={measurements.hasSolarSystem === false} onChange={() => setMeasurements({ hasSolarSystem: false })} /><span className="text-sm">Nee</span></label></div></div></div>
               <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-gray-500">Stroomstelsel</label><select className="border rounded p-2 w-full" value={measurements.installationType} onChange={(e) => setMeasurements({installationType: e.target.value as any})}><option value="TT">TT-Stelsel</option><option value="TN-S">TN-S</option><option value="TN-C-S">TN-C-S</option></select></div><div><label className="text-xs text-gray-500">Bouwjaar</label><input className="border rounded p-2 w-full" type="number" value={measurements.yearOfConstruction || ''} onChange={(e) => setMeasurements({yearOfConstruction: e.target.value})} /></div><div className="col-span-2 md:col-span-1"><label className="text-xs text-gray-500">Voorbeveiliging</label><div className="flex gap-2"><select className="border rounded p-2 w-full" value={isCustomFuse ? 'custom' : measurements.mainFuse} onChange={(e) => { if (e.target.value === 'custom') setMeasurements({ mainFuse: '' }); else setMeasurements({ mainFuse: e.target.value }); }}>{FUSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}<option value="custom">Anders...</option></select></div>{(isCustomFuse || measurements.mainFuse === '') && (<input className="border rounded p-2 w-full mt-2 bg-gray-50" value={measurements.mainFuse || ''} onChange={(e) => setMeasurements({mainFuse: e.target.value})} placeholder="Waarde..." />)}</div><div><label className="text-xs text-gray-500">Temp (°C)</label><input className="border rounded p-2 w-full" type="number" value={measurements.switchboardTemp || ''} onChange={(e) => setMeasurements({switchboardTemp: e.target.value})} /></div><div><label className="text-xs text-gray-500">Riso (MΩ)</label><input className="border rounded p-2 w-full" type="number" step="10" value={measurements.insulationResistance || ''} onChange={(e) => setMeasurements({insulationResistance: e.target.value})} /></div><div><label className="text-xs text-gray-500">Zi (Ω)</label><input className="border rounded p-2 w-full" type="number" step="0.01" value={measurements.impedance || ''} onChange={(e) => setMeasurements({impedance: e.target.value})} /></div></div>
            </div>
          )}

          {activeTab === 'inspect' && (
            <div className="space-y-6">
              
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                 <h2 className="text-sm font-bold text-yellow-800 uppercase border-b border-yellow-300 pb-2 mb-3 flex items-center gap-2"><FileText size={16}/> Bibliotheek Beheer</h2>
                 <p className="text-xs text-gray-600 mb-3">Gebruik een eigen Excel/CSV-lijst in plaats van de standaard gebreken.</p>
                 <div className="flex gap-2 items-center">
                    <button onClick={() => csvInputRef.current?.click()} className="bg-yellow-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-yellow-700 flex items-center gap-2">
                        <Upload size={14}/> CSV Importeren
                    </button>
                    <input type="file" ref={csvInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
                    
                    {customLibrary && (
                        <button onClick={resetLibrary} className="text-red-500 text-xs font-bold underline hover:text-red-700 flex items-center gap-1">
                            <RefreshCw size={12}/> Herstel Standaard
                        </button>
                    )}
                 </div>
                 {customLibrary ? (
                     <div className="mt-2 text-xs text-green-700 font-bold">✓ Eigen lijst actief ({customLibrary.length} items)</div>
                 ) : (
                     <div className="mt-2 text-xs text-gray-500">Standaard lijst actief</div>
                 )}
               </div>

              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-5">
                <h3 className="font-bold text-gray-800 mb-4">{editingId ? 'Gebrek Bewerken' : 'Nieuw Gebrek Melden'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locatie</label>
                    <input className="w-full border rounded p-2" placeholder="Bijv. Meterkast begane grond" value={location} onChange={(e) => setLocation(e.target.value)}/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Hoofdcategorie</label>
                    {isCreatingCategory ? (
                      <div className="flex gap-2">
                        <input className="w-full border rounded p-2 border-emerald-500 bg-emerald-50" placeholder="Typ nieuwe categorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                        <button onClick={() => {setIsCreatingCategory(false); setSelectedMainCategory('');}} className="p-2 text-gray-500 hover:text-red-500"><X size={20}/></button>
                      </div>
                    ) : (
                      <select className="w-full border rounded p-2 bg-gray-50" value={selectedMainCategory} onChange={(e) => handleMainCategoryChange(e.target.value)}>
                        <option value="">-- Kies Hoofdcategorie --</option>
                        {mainCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option disabled>----------------</option>
                        <option value="NEW" className="font-bold text-emerald-600">+ Nieuwe Categorie toevoegen...</option>
                      </select>
                    )}
                  </div>

                  {!isCreatingCategory && selectedMainCategory && (
                    <div className="animate-fadeIn">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. Subcategorie</label>
                        <select className="w-full border rounded p-2" value={selectedSubCategory} onChange={(e) => handleSubCategoryChange(e.target.value)}>
                            <option value="">-- Kies Subcategorie --</option>
                            {subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                  )}

                  {!isCreatingCategory && selectedSubCategory && (
                    <div className="animate-fadeIn">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">3. Soort Gebrek</label>
                        <select className="w-full border rounded p-2" value={isCustomDefect ? 'CUSTOM' : selectedLibId} onChange={(e) => handleDefectChange(e.target.value)}>
                        <option value="" disabled>-- Kies Gebrek --</option>
                        <option value="CUSTOM" className="font-bold text-blue-600">--- Eigen omschrijving / Maatwerk ---</option>
                        <option disabled>----------------</option>
                        {filteredDefects.map(d => <option key={d.id} value={d.id}>{d.shortName}</option>)}
                        </select>
                    </div>
                  )}

                  {(selectedLibId || isCustomDefect) && (
                    <div className="space-y-4 animate-fadeIn pt-2">
                        {!isCustomDefect && staticDescription && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Toelichting (Standaard)</label>
                                <div className="w-full border rounded p-3 bg-gray-100 text-gray-700 text-sm whitespace-pre-wrap">
                                    {staticDescription}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                {isCustomDefect ? 'Omschrijving Gebrek (Verplicht)' : 'Aanvullende Toelichting (Optioneel)'}
                            </label>
                            <textarea 
                                className={`w-full border rounded p-2 h-24 ${isCustomDefect ? 'border-blue-300 bg-blue-50' : ''}`} 
                                placeholder={isCustomDefect ? "Typ hier de volledige omschrijving..." : "Voeg hier details toe (bijv. 'In lokaal 3.02')..."} 
                                value={customComment} 
                                onChange={(e) => setCustomComment(e.target.value)} 
                            />
                        </div>

                        {isCustomDefect && (
                            <div className="bg-blue-50 p-4 rounded border border-blue-100 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Classificatie (Ernst)</label>
                                    <div className="flex gap-2">
                                        {(['Red', 'Orange', 'Yellow', 'Blue'] as Classification[]).map(c => (
                                            <button key={c} onClick={() => setCustomClassification(c)} className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${customClassification === c ? (c === 'Red' ? 'bg-red-600 text-white' : c === 'Orange' ? 'bg-orange-500 text-white' : c === 'Yellow' ? 'bg-yellow-400 text-black' : 'bg-blue-500 text-white') : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                                                {c === 'Red' ? 'Ernstig' : c === 'Orange' ? 'Serieus' : c === 'Yellow' ? 'Gering' : 'Info'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vereiste Actie</label>
                                    <input className="w-full border rounded p-2" placeholder="Bijv. Herstellen, Vervangen, Nader Onderzoek..." value={customAction} onChange={(e) => setCustomAction(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <label className="flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200 transition"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onDefectPhoto(e, 1)} /></label>
                    {defectPhoto1 && <img src={defectPhoto1} className="w-12 h-12 object-cover rounded border" />}
                    <label className="flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200 transition"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onDefectPhoto(e, 2)} /></label>
                    {defectPhoto2 && <img src={defectPhoto2} className="w-12 h-12 object-cover rounded border" />}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingId && (<button onClick={handleCancelEdit} className="flex-1 bg-gray-400 text-white py-3 rounded font-bold hover:bg-gray-500">Annuleren</button>)}
                    <button onClick={handleSaveDefect} disabled={!location || (isCustomDefect && !customComment) || (!isCustomDefect && !selectedLibId)} className="flex-1 bg-emerald-600 text-white py-3 rounded font-bold disabled:bg-gray-300 hover:bg-emerald-700 transition shadow">
                      {editingId ? 'Wijziging Opslaan' : 'Toevoegen aan Rapport'}
                    </button>
                  </div>
                </div>
              </div>

              {/* GEBREKEN LIJST */}
              <div className="space-y-3">
                {defects.length === 0 && <div className="text-center text-gray-400 py-10 italic">Nog geen gebreken toegevoegd.</div>}
                {defects.map(d => (
                  <div key={d.id} className="bg-white border-l-4 shadow-sm p-4 rounded flex justify-between items-start group hover:shadow-md transition" style={{ borderColor: d.classification === 'Red' ? '#ef4444' : d.classification === 'Orange' ? '#f97316' : d.classification === 'Yellow' ? '#facc15' : '#3b82f6' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{d.location}</span>
                            {d.libraryId ? <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 border">Standaard</span> : <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded text-blue-600 border border-blue-100">Maatwerk</span>}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{d.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><AlertTriangle size={12}/> {d.classification}</span>
                            <span className="flex items-center gap-1"><Info size={12}/> {d.action}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEdit(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Pencil size={18} /></button>
                      <button onClick={() => removeDefect(d.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                    </div>
                  </div>
              ))}
              </div>
            </div>
          )}

          {/* REPORT TAB */}
          {activeTab === 'report' && (
            <div className="text-center py-6 space-y-6">
              <div className="bg-indigo-50 p-4 rounded border border-indigo-100 text-left">
                <h3 className="font-bold text-indigo-800 border-b border-indigo-200 pb-2 mb-3 flex items-center gap-2"><Calendar size={18}/> Advies Inspectiefrequentie</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Interval:</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 3} onChange={() => setMeta({ inspectionInterval: 3 })} /> 3 Jaar</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 5} onChange={() => setMeta({ inspectionInterval: 5 })} /> 5 Jaar</label></div></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Grondslag:</label><div className="flex flex-col gap-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={meta.inspectionBasis.verzekering} onChange={(e) => setMeta({ inspectionBasis: { ...meta.inspectionBasis, verzekering: e.target.checked } })} /> Conform verzekeringspolis</label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={meta.inspectionBasis.nta8220} onChange={(e) => setMeta({ inspectionBasis: { ...meta.inspectionBasis, nta8220: e.target.checked } })} /> Conform NTA 8220:2017</label></div></div>
                  <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">Volgende inspectie uiterlijk:</span><span className="font-bold text-indigo-600">{meta.nextInspectionDate || 'Kies eerst een datum'}</span></div>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow-sm border"><h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Handtekening Inspecteur</h3>{!meta.signatureUrl ? (<div className="border border-gray-300 rounded bg-gray-50"><SignatureCanvas ref={sigPad} canvasProps={{width: 300, height: 150, className: 'mx-auto cursor-crosshair'}} /><div className="border-t flex justify-end p-2 gap-2"><button onClick={clearSignature} className="text-xs text-red-500 font-bold">Wissen</button><button onClick={saveSignature} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded font-bold">Opslaan</button></div></div>) : (<div className="flex flex-col items-center"><img src={meta.signatureUrl} className="border h-24 mb-2" /><button onClick={() => setMeta({signatureUrl: ''})} className="text-xs text-red-500 underline">Opnieuw tekenen</button></div>)}</div>
              
              {/* DOWNLOAD & SHARE KNOPPEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <button 
                      onClick={handleShareFindings}
                      className="bg-purple-600 text-white px-6 py-4 rounded-lg font-bold shadow hover:bg-purple-700 flex items-center justify-center gap-3"
                  >
                      <Share2 size={20} />
                      <span>Bevindingen Delen (JSON)</span>
                  </button>

                  <button 
                      onClick={handleDownloadPDF}
                      disabled={isGenerating || !meta.signatureUrl}
                      className="bg-blue-600 text-white px-6 py-4 rounded-lg font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-3 disabled:bg-gray-400"
                  >
                      {isGenerating ? (
                          <>
                          <RefreshCw className="animate-spin" size={20} />
                          <span>Genereren...</span>
                          </>
                      ) : (
                          <>
                          <Download size={20} />
                          <span>Rapport (PDF)</span>
                          </>
                      )}
                  </button>
              </div>

              {!meta.signatureUrl && <p className="text-xs text-red-500">U moet eerst tekenen en opslaan.</p>}
            </div>
          )}
        </div>

        <div className="bg-white border-t p-4 flex justify-between items-center sticky bottom-0 shadow-inner">
          <button onClick={goPrev} disabled={currentStepIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={18} /> Vorige</button>
          {currentStepIndex < STEPS.length - 1 ? (<button onClick={goNext} className="flex items-center gap-2 px-6 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">Volgende <ChevronRight size={18} /></button>) : (<span className="text-sm font-bold text-emerald-700 flex items-center gap-2">Klaar om te exporteren</span>)}
        </div>
      </div>
    </div>
  );
}