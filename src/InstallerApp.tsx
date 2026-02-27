import { useEffect, useState, useRef, type ReactNode } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { LogOut, ArrowLeft, Upload, FileText, User, X, Search, RefreshCw, MapPin } from 'lucide-react';
import { Defect, InspectionDbRow } from './types';
import { compressImage, uploadPhotoToCloud } from './utils';
import { parsePlaceResult, fetchPlaces, lookupAddressBAG } from './utils/placesSearch';
import { pdf } from '@react-pdf/renderer';
import { PDFReport } from './components/PDFReport';
import type { SupabaseClient } from '@supabase/supabase-js';

interface InstallerAppProps {
  supabase: SupabaseClient;
  userId: string;
  onLogout: () => void;
}

const CLASSIFICATION_STYLE: Record<string, { border: string; badge: string; label: string }> = {
  Red:    { border: '#ef4444', badge: 'bg-red-500 text-white',    label: 'Rood' },
  Amber:  { border: '#f59e0b', badge: 'bg-amber-500 text-white',  label: 'Amber' },
  Orange: { border: '#f97316', badge: 'bg-orange-500 text-white', label: 'Oranje' },
  Yellow: { border: '#eab308', badge: 'bg-yellow-400 text-white', label: 'Geel' },
  Blue:   { border: '#3b82f6', badge: 'bg-blue-500 text-white',   label: 'Blauw' },
};

const USAGE_LABELS: Record<string, string> = {
  woonfunctie: 'Woonfunctie', bijeenkomstfunctie: 'Bijeenkomstfunctie', celfunctie: 'Celfunctie',
  gezondheidszorgfunctie: 'Gezondheidszorgfunctie', industriefunctie: 'Industriefunctie',
  kantoorfunctie: 'Kantoorfunctie', logiesfunctie: 'Logiesfunctie', onderwijsfunctie: 'Onderwijsfunctie',
  sportfunctie: 'Sportfunctie', winkelfunctie: 'Winkelfunctie',
  overigeGebruiksfunctie: 'Overige gebruiksfunctie', bouwwerkGeenGebouw: 'Bouwwerk geen gebouw',
};

type Screen = 'overview' | 'inspection' | 'signature' | 'profile';
type InspectionTab = 'basis' | 'gebreken';
type ProfileTab = 'persoonlijk' | 'bedrijf' | 'handtekening';

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'persoonlijk', label: 'Persoonlijk' },
  { id: 'bedrijf', label: 'Mijn Bedrijf' },
  { id: 'handtekening', label: 'Handtekening' },
];


export default function InstallerApp({ supabase, userId, onLogout }: InstallerAppProps) {
  // Navigation
  const [screen, setScreen] = useState<Screen>('overview');
  const [inspectionTab, setInspectionTab] = useState<InspectionTab>('basis');
  const [profileTab, setProfileTab] = useState<ProfileTab>('persoonlijk');

  // Data
  const [inspections, setInspections] = useState<InspectionDbRow[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<InspectionDbRow | null>(null);
  const [localDefects, setLocalDefects] = useState<Defect[]>([]);
  const [userProfile, setUserProfile] = useState({
    full_name: '', phone: '', contact_email: '', signature_url: '',
    installer_company: { name: '', address: '', postalCode: '', city: '', phone: '', email: '' },
  });

  // UI state
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [placesQuery, setPlacesQuery] = useState('');
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchPlaces = async (query: string) => {
    setIsSearchingPlaces(true);
    setPlacesResults(await fetchPlaces(query));
    setIsSearchingPlaces(false);
  };
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Refs
  const sigPad        = useRef<SignatureCanvas>(null);
  const profileSigPad = useRef<SignatureCanvas>(null);

  useEffect(() => { fetchProfile(); fetchInspections(); }, []);

  // ---- DATA FETCHERS ----

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, contact_email, signature_url, installer_company')
      .eq('id', userId)
      .single();
    if (data) {
      setUserProfile({
        full_name:           data.full_name || '',
        phone:               data.phone || '',
        contact_email:       data.contact_email || '',
        signature_url:       data.signature_url || '',
        installer_company:   data.installer_company || { name: '', address: '', postalCode: '', city: '', phone: '', email: '' },
      });
    }
  };

  const fetchInspections = async () => {
    setLoadingInspections(true);
    const { data } = await supabase
      .from('inspections')
      .select('*')
      .eq('installer_id', userId)
      .in('status', ['herstel_wacht', 'ter_controle'])
      .order('created_at', { ascending: false });
    setInspections(data || []);
    setLoadingInspections(false);
  };

  // ---- INSPECTION ACTIONS ----

  const handleOpenInspection = (row: InspectionDbRow) => {
    setSelectedInspection(row);
    setLocalDefects([...row.report_data.defects]);
    setInspectionTab('basis');
    setScreen('inspection');
  };

  const updateDefect = (defectId: string, changes: Partial<Defect>) =>
    setLocalDefects(prev => prev.map(d => d.id === defectId ? { ...d, ...changes } : d));

  const handlePhotoUpload = async (defectId: string, slot: 1 | 2, file: File) => {
    const key = `${defectId}-${slot}`;
    setIsUploading(prev => ({ ...prev, [key]: true }));
    try {
      const compressed = await compressImage(file, 'defect');
      const url = await uploadPhotoToCloud(compressed);
      if (url) updateDefect(defectId, slot === 1 ? { repairPhotoUrl1: url } : { repairPhotoUrl2: url });
    } catch { alert('Fout bij uploaden foto.'); }
    finally { setIsUploading(prev => ({ ...prev, [key]: false })); }
  };

  const handleDownloadOriginalPDF = async () => {
    if (!selectedInspection?.report_data) return;
    setIsGeneratingPdf(true);
    try {
      const { meta, defects, measurements } = selectedInspection.report_data;
      const blob = await pdf(
        <PDFReport meta={meta} defects={defects || []} measurements={measurements} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_${meta.date || 'Datum'}_${meta.clientName || 'Klant'}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert('Fout bij genereren PDF'); }
    finally { setIsGeneratingPdf(false); }
  };

  const handleSubmit = async () => {
    if (!selectedInspection) return;
    if (sigPad.current?.isEmpty()) { alert('Zet uw handtekening om in te dienen.'); return; }
    setIsSaving(true);
    const sigData = sigPad.current?.getCanvas().toDataURL('image/png');
    const updatedReportData = {
      ...selectedInspection.report_data,
      defects: localDefects,
      meta: {
        ...selectedInspection.report_data.meta,
        installerSignature: sigData,
        installerName: userProfile.full_name,
        repairDate: new Date().toISOString().split('T')[0],
      },
    };
    const { error } = await supabase
      .from('inspections')
      .update({ report_data: updatedReportData, status: 'ter_controle' })
      .eq('id', selectedInspection.id);
    setIsSaving(false);
    if (error) { alert('Fout bij indienen: ' + error.message); return; }
    setScreen('overview');
    fetchInspections();
  };

  // ---- PROFILE ACTIONS ----

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      full_name:     userProfile.full_name,
      phone:         userProfile.phone,
      contact_email: userProfile.contact_email,
    }).eq('id', userId);
    setIsSavingProfile(false);
    if (error) alert('Fout: ' + error.message); else alert('Opgeslagen!');
  };

  const handleSaveCompany = async () => {
    setIsSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      installer_company: userProfile.installer_company,
    }).eq('id', userId);
    setIsSavingProfile(false);
    if (error) alert('Fout: ' + error.message); else alert('Bedrijfsgegevens opgeslagen!');
  };

  const saveProfileSignature = async () => {
    if (!profileSigPad.current || profileSigPad.current.isEmpty()) return alert('Teken eerst een handtekening.');
    const sigUrl = profileSigPad.current.getCanvas().toDataURL('image/png');
    setUserProfile(prev => ({ ...prev, signature_url: sigUrl }));
    setIsSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ signature_url: sigUrl }).eq('id', userId);
    setIsSavingProfile(false);
    if (error) alert('Fout: ' + error.message);
  };

  // ---- COMPUTED ----
  const allRepaired    = localDefects.length > 0 && localDefects.every(d => d.isRepaired === true);
  const repairedCount  = localDefects.filter(d => d.isRepaired).length;
  const isSubmitted    = selectedInspection?.status === 'ter_controle';

  // ================================================================
  // PHOTO ZOOM OVERLAY (renders on top of everything)
  // ================================================================
  if (zoomedPhoto) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={() => setZoomedPhoto(null)}
      >
        <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 z-10">
          <X size={24} />
        </button>
        <img
          src={zoomedPhoto}
          className="max-w-full max-h-full object-contain select-none"
          style={{ touchAction: 'pinch-zoom' }}
          onClick={e => e.stopPropagation()}
          alt="Vergrote foto"
        />
      </div>
    );
  }

  // ================================================================
  // SCREEN: PROFILE
  // ================================================================
  if (screen === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button onClick={() => setScreen('overview')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} /> Terug
          </button>
          <span className="font-bold text-gray-800">Mijn Profiel</span>
          <div />
        </header>

        <div className="bg-white border-b">
          <div className="flex max-w-lg mx-auto">
            {PROFILE_TABS.map(tab => (
              <button key={tab.id} onClick={() => setProfileTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  profileTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">

          {/* ---- TAB: PERSOONLIJK ---- */}
          {profileTab === 'persoonlijk' && (
            <>
              <div className="bg-white rounded-xl shadow p-4 space-y-3">
                <p className="font-semibold text-gray-700 text-sm border-b pb-2">Persoonlijke gegevens</p>
                {[
                  { key: 'full_name',     label: 'Volledige naam',  placeholder: 'Je naam', type: 'text' },
                  { key: 'phone',         label: 'Telefoon',        placeholder: '06-...', type: 'tel' },
                  { key: 'contact_email', label: 'Contact e-mail',  placeholder: 'jouw@email.nl', type: 'email' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-500">{f.label}</label>
                    <input
                      type={f.type}
                      className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm"
                      value={(userProfile as any)[f.key]}
                      onChange={e => setUserProfile(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveProfile} disabled={isSavingProfile}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                {isSavingProfile ? 'Opslaan...' : 'Opslaan'}
              </button>
            </>
          )}

          {/* ---- TAB: MIJN BEDRIJF ---- */}
          {profileTab === 'bedrijf' && (
            <>
              <div className="bg-white rounded-xl shadow p-4 space-y-3">
                <p className="font-semibold text-gray-700 text-sm border-b pb-2">Bedrijfsgegevens</p>
                {/* Google Places zoeking */}
                <div className="relative">
                  <div className="flex gap-1.5">
                    <input type="text" placeholder="Zoek bedrijf..." className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                      value={placesQuery} onChange={e => setPlacesQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                    <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                      className="px-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                      {isSearchingPlaces ? <RefreshCw size={15} className="animate-spin"/> : <Search size={15}/>}
                    </button>
                  </div>
                  {placesResults.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {placesResults.map((p, i) => {
                        const parsed = parsePlaceResult(p);
                        return (
                          <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                            onClick={() => {
                              setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, name: parsed.name, address: parsed.address, postalCode: parsed.postalCode, city: parsed.city, phone: parsed.phone } }));
                              setPlacesResults([]); setPlacesQuery('');
                            }}>
                            <div className="font-bold text-gray-800">{parsed.name}</div>
                            <div className="text-xs text-gray-500">{p.formattedAddress}</div>
                          </button>
                        );
                      })}
                      <button className="w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50" onClick={() => setPlacesResults([])}>Sluiten</button>
                    </div>
                  )}
                </div>
                {/* Bedrijfsnaam */}
                <div>
                  <label className="text-xs text-gray-500">Bedrijfsnaam</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm" value={userProfile.installer_company.name || ''}
                    onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, name: e.target.value } }))} placeholder="Installatiebedrijf B.V." />
                </div>
                {/* Adres */}
                <div>
                  <label className="text-xs text-gray-500">Adres</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm" value={userProfile.installer_company.address || ''}
                    onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, address: e.target.value } }))} placeholder="Straat 1" />
                </div>
                {/* Postcode + Plaats */}
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <label className="text-xs text-gray-500">Postcode</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm" value={userProfile.installer_company.postalCode || ''}
                      onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, postalCode: e.target.value } }))} placeholder="1234 AB" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Plaats</label>
                    <div className="relative mt-0.5">
                      <input className="w-full border border-gray-300 rounded-lg p-2 pr-8 text-sm" value={userProfile.installer_company.city || ''}
                        onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, city: e.target.value } }))} placeholder="Amsterdam" />
                      <button title="Adres opzoeken via postcode (PDOK)" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        onClick={async () => {
                          const r = await lookupAddressBAG(userProfile.installer_company.postalCode || '', userProfile.installer_company.address || '');
                          if (r) setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, city: r.city } }));
                          else alert('Adres niet gevonden. Controleer postcode en huisnummer.');
                        }}>
                        <MapPin size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Telefoon */}
                <div>
                  <label className="text-xs text-gray-500">Telefoon</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm" value={userProfile.installer_company.phone || ''}
                    onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, phone: e.target.value } }))} placeholder="020-1234567" />
                </div>
                {/* E-mail */}
                <div>
                  <label className="text-xs text-gray-500">E-mail</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm" value={userProfile.installer_company.email || ''}
                    onChange={e => setUserProfile(prev => ({ ...prev, installer_company: { ...prev.installer_company, email: e.target.value } }))} placeholder="info@bedrijf.nl" />
                </div>
              </div>
              <button onClick={handleSaveCompany} disabled={isSavingProfile}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                {isSavingProfile ? 'Opslaan...' : 'Opslaan'}
              </button>
            </>
          )}

          {/* ---- TAB: HANDTEKENING ---- */}
          {profileTab === 'handtekening' && (
            <div className="bg-white rounded-xl shadow p-4 space-y-4">
              <p className="font-semibold text-gray-700 text-sm border-b pb-2">Handtekening</p>
              {userProfile.signature_url ? (
                <div className="space-y-3">
                  <img src={userProfile.signature_url}
                    className="border rounded-lg h-32 w-full object-contain bg-gray-50 p-2"
                    alt="Opgeslagen handtekening" />
                  <button
                    onClick={() => setUserProfile(prev => ({ ...prev, signature_url: '' }))}
                    className="text-sm text-red-500 underline">
                    Opnieuw tekenen
                  </button>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                    <SignatureCanvas ref={profileSigPad}
                      canvasProps={{ className: 'w-full', height: 200 }}
                      backgroundColor="white" penColor="black" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => profileSigPad.current?.clear()}
                      className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
                      Wissen
                    </button>
                    <button onClick={saveProfileSignature} disabled={isSavingProfile}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
                      {isSavingProfile ? 'Opslaan...' : 'Opslaan'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================================================================
  // SCREEN: SIGNATURE
  // ================================================================
  if (screen === 'signature' && selectedInspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button onClick={() => setScreen('inspection')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} /> Terug
          </button>
          <span className="font-bold text-gray-800">Handtekening plaatsen</span>
          <div />
        </header>

        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-xl shadow p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400">Installateur</p><p className="font-semibold">{userProfile.full_name || '-'}</p></div>
              <div><p className="text-gray-400">Datum herstel</p><p className="font-semibold">{new Date().toLocaleDateString('nl-NL')}</p></div>
              <div><p className="text-gray-400">Gebreken hersteld</p><p className="font-semibold">{repairedCount} van {localDefects.length}</p></div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium">Handtekening</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas ref={sigPad}
                  canvasProps={{ className: 'w-full', height: 200 }}
                  backgroundColor="white" penColor="black" />
              </div>
              <button onClick={() => sigPad.current?.clear()} className="mt-1 text-xs text-red-500 underline">Wissen</button>
            </div>

            <button onClick={handleSubmit} disabled={isSaving}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 text-sm">
              {isSaving ? 'Bezig met indienen...' : 'Bevestigen & Indienen ✓'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // SCREEN: INSPECTION DETAIL
  // ================================================================
  if (screen === 'inspection' && selectedInspection) {
    const meta = selectedInspection.report_data.meta;
    const activeUsageFunctions = Object.entries(meta.usageFunctions || {})
      .filter(([, v]) => v === true)
      .map(([k]) => USAGE_LABELS[k] || k);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button onClick={() => setScreen('overview')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} /> Terug
          </button>
          <span className="font-bold text-gray-800 truncate max-w-[55%]">{meta.clientName}</span>
          {isSubmitted
            ? <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Ter Controle</span>
            : <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Wacht op Herstel</span>
          }
        </header>

        {/* Tab bar */}
        <div className="bg-white border-b">
          <div className="flex">
            {([
              { id: 'basis' as InspectionTab, label: 'Basisgegevens' },
              { id: 'gebreken' as InspectionTab, label: `Gebreken (${repairedCount}/${localDefects.length})` },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setInspectionTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  inspectionTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- TAB: BASISGEGEVENS ---- */}
        {inspectionTab === 'basis' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4 pb-8">
            {/* Download origineel rapport */}
            <button onClick={handleDownloadOriginalPDF} disabled={isGeneratingPdf}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-sm">
              <FileText size={16} />
              {isGeneratingPdf ? 'PDF laden...' : 'Download Origineel Inspectierapport (PDF)'}
            </button>

            <Section title="Inspectiegegevens">
              <InfoRow label="Inspectienummer"   value={meta.inspectionNumber} />
              <InfoRow label="Datum inspectie"   value={meta.date} />
              <InfoRow label="Scope"             value={meta.sciosScope || meta.scopeType} />
              <InfoRow label="Inspecteur"        value={meta.inspectorName} />
              <InfoRow label="SCIOS nr."         value={meta.sciosRegistrationNumber} />
              {meta.additionalInspectors?.length > 0 && (
                <InfoRow label="Overige inspecteurs" value={meta.additionalInspectors.join(', ')} />
              )}
            </Section>

            <Section title="Klantgegevens">
              <InfoRow label="Naam"            value={meta.clientName} />
              <InfoRow label="Adres"           value={meta.clientAddress} />
              <InfoRow label="Postcode/Plaats" value={`${meta.clientPostalCode || ''} ${meta.clientCity || ''}`.trim()} />
              <InfoRow label="Contactpersoon"  value={meta.clientContactPerson} />
              <InfoRow label="Telefoon"        value={meta.clientPhone} />
              <InfoRow label="E-mail"          value={meta.clientEmail} />
            </Section>

            <Section title="Projectgegevens">
              <InfoRow label="Locatie"           value={meta.projectLocation} />
              <InfoRow label="Adres"             value={meta.projectAddress} />
              <InfoRow label="Postcode/Plaats"   value={`${meta.projectPostalCode || ''} ${meta.projectCity || ''}`.trim()} />
              <InfoRow label="Contactpersoon"    value={meta.projectContactPerson} />
              <InfoRow label="Telefoon"          value={meta.projectPhone} />
              <InfoRow label="Installatieverant." value={meta.installationResponsible} />
            </Section>

            <Section title="Inspectiepartij">
              <InfoRow label="Bedrijf"   value={meta.inspectionCompany} />
              <InfoRow label="Adres"     value={`${meta.inspectionCompanyAddress || ''}, ${meta.inspectionCompanyPostalCode || ''} ${meta.inspectionCompanyCity || ''}`.trim().replace(/^,\s*/, '')} />
              <InfoRow label="Telefoon"  value={meta.inspectionCompanyPhone} />
              <InfoRow label="E-mail"    value={meta.inspectionCompanyEmail} />
            </Section>

            <Section title="Inspectiegrondslag">
              <InfoRow label="Grondslag"           value={[meta.inspectionBasis?.nta8220 && 'NTA 8220', meta.inspectionBasis?.verzekering && 'Verzekering'].filter(Boolean).join(', ') || '-'} />
              <InfoRow label="Inspectie-interval"  value={meta.inspectionInterval ? `${meta.inspectionInterval} jaar` : undefined} />
              <InfoRow label="Volgende inspectie"  value={meta.nextInspectionDate} />
            </Section>

            {activeUsageFunctions.length > 0 && (
              <Section title="Gebruiksfuncties">
                <div className="flex flex-wrap gap-1.5 px-3 py-2">
                  {activeUsageFunctions.map(fn => (
                    <span key={fn} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{fn}</span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ---- TAB: GEBREKEN ---- */}
        {inspectionTab === 'gebreken' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 max-w-lg mx-auto w-full space-y-4 pb-32">
              {localDefects.length === 0 && (
                <p className="text-center text-gray-400 mt-8 italic">Geen gebreken geregistreerd.</p>
              )}

              {localDefects.map((defect, i) => {
                const cs = CLASSIFICATION_STYLE[defect.classification] ?? CLASSIFICATION_STYLE['Blue'];
                return (
                  <div key={defect.id} className="bg-white rounded-xl shadow border-l-4" style={{ borderColor: cs.border }}>

                    {/* Defect info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">#{i + 1}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${cs.badge}`}>{cs.label}</span>
                        </div>
                        {defect.isRepaired && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">✓ Hersteld</span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800">{defect.location}</p>
                      <p className="text-sm text-gray-600 mt-1">{defect.description}</p>
                      {defect.category && (
                        <p className="text-xs text-gray-400 mt-1">{defect.category}{defect.subcategory ? ` › ${defect.subcategory}` : ''}</p>
                      )}

                      {/* Original photos (klikbaar) */}
                      {(defect.photoUrl || defect.photoUrl2) && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400 mb-1.5">Inspecteur foto('s) — klik om te vergroten</p>
                          <div className="flex gap-2 flex-wrap">
                            {defect.photoUrl && (
                              <button onClick={() => setZoomedPhoto(defect.photoUrl!)} className="focus:outline-none">
                                <img src={defect.photoUrl} className="h-24 w-24 object-cover rounded-lg border cursor-zoom-in hover:opacity-90 transition" alt="Foto gebrek" />
                              </button>
                            )}
                            {defect.photoUrl2 && (
                              <button onClick={() => setZoomedPhoto(defect.photoUrl2!)} className="focus:outline-none">
                                <img src={defect.photoUrl2} className="h-24 w-24 object-cover rounded-lg border cursor-zoom-in hover:opacity-90 transition" alt="Foto gebrek 2" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Herstel invoer (alleen als niet ingediend) */}
                    {!isSubmitted && (
                      <div className="border-t bg-gray-50 rounded-b-xl p-4 space-y-3">
                        {/* Hidden file inputs */}
                        <input id={`p1-${defect.id}`} type="file" accept="image/*" className="hidden"
                          onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(defect.id, 1, e.target.files[0]); e.target.value = ''; }} />
                        <input id={`p2-${defect.id}`} type="file" accept="image/*" className="hidden"
                          onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(defect.id, 2, e.target.files[0]); e.target.value = ''; }} />

                        {/* Foto upload tiles */}
                        <div className="flex gap-2 flex-wrap">
                          {/* Slot 1 */}
                          {defect.repairPhotoUrl1 ? (
                            <div className="relative">
                              <button onClick={() => setZoomedPhoto(defect.repairPhotoUrl1!)} className="focus:outline-none">
                                <img src={defect.repairPhotoUrl1} className="h-20 w-20 object-cover rounded-lg border cursor-zoom-in" alt="Herstel foto 1" />
                              </button>
                              <button onClick={() => updateDefect(defect.id, { repairPhotoUrl1: undefined })}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                                ×
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => document.getElementById(`p1-${defect.id}`)?.click()}
                              disabled={!!isUploading[`${defect.id}-1`]}
                              className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50 text-xs gap-1 transition">
                              <Upload size={16} />
                              <span>{isUploading[`${defect.id}-1`] ? '...' : 'Foto 1'}</span>
                            </button>
                          )}

                          {/* Slot 2 */}
                          {defect.repairPhotoUrl2 ? (
                            <div className="relative">
                              <button onClick={() => setZoomedPhoto(defect.repairPhotoUrl2!)} className="focus:outline-none">
                                <img src={defect.repairPhotoUrl2} className="h-20 w-20 object-cover rounded-lg border cursor-zoom-in" alt="Herstel foto 2" />
                              </button>
                              <button onClick={() => updateDefect(defect.id, { repairPhotoUrl2: undefined })}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                                ×
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => document.getElementById(`p2-${defect.id}`)?.click()}
                              disabled={!!isUploading[`${defect.id}-2`]}
                              className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 disabled:opacity-50 text-xs gap-1 transition">
                              <Upload size={16} />
                              <span>{isUploading[`${defect.id}-2`] ? '...' : 'Foto 2'}</span>
                            </button>
                          )}
                        </div>

                        {/* Herstelopmerking */}
                        <textarea
                          value={defect.repairRemarks || ''}
                          onChange={e => updateDefect(defect.id, { repairRemarks: e.target.value })}
                          rows={2}
                          placeholder="Herstelopmerking..."
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                        />

                        {/* Hersteld checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition">
                          <input type="checkbox"
                            checked={defect.isRepaired === true}
                            onChange={e => updateDefect(defect.id, { isRepaired: e.target.checked })}
                            className="w-5 h-5 accent-emerald-600" />
                          <span className="text-sm font-semibold text-gray-800">Markeer als hersteld ✓</span>
                        </label>
                      </div>
                    )}

                    {/* Read-only herstelinfo (als ingediend) */}
                    {isSubmitted && (defect.repairRemarks || defect.repairPhotoUrl1 || defect.repairPhotoUrl2) && (
                      <div className="border-t bg-emerald-50 rounded-b-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-emerald-700">Ingediende herstelnotities</p>
                        {defect.repairRemarks && <p className="text-sm text-gray-700">{defect.repairRemarks}</p>}
                        {(defect.repairPhotoUrl1 || defect.repairPhotoUrl2) && (
                          <div className="flex gap-2 flex-wrap">
                            {defect.repairPhotoUrl1 && (
                              <button onClick={() => setZoomedPhoto(defect.repairPhotoUrl1!)} className="focus:outline-none">
                                <img src={defect.repairPhotoUrl1} className="h-16 w-16 object-cover rounded border cursor-zoom-in" alt="Herstel foto" />
                              </button>
                            )}
                            {defect.repairPhotoUrl2 && (
                              <button onClick={() => setZoomedPhoto(defect.repairPhotoUrl2!)} className="focus:outline-none">
                                <img src={defect.repairPhotoUrl2} className="h-16 w-16 object-cover rounded border cursor-zoom-in" alt="Herstel foto 2" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vaste footer: Afronden knop */}
            {!isSubmitted && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-gray-500">{repairedCount} van {localDefects.length} gebreken gemarkeerd</span>
                  {allRepaired && <span className="text-emerald-600 font-bold text-xs">✓ Gereed</span>}
                </div>
                <button
                  onClick={() => setScreen('signature')}
                  disabled={!allRepaired}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  {allRepaired
                    ? 'Afronden & Ondertekenen →'
                    : `Nog ${localDefects.length - repairedCount} gebrek${localDefects.length - repairedCount !== 1 ? 'en' : ''} te markeren`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ================================================================
  // SCREEN: OVERVIEW
  // ================================================================
  const statusBadge = (status: string) => {
    if (status === 'herstel_wacht')
      return <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Wacht op Herstel</span>;
    if (status === 'ter_controle')
      return <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Ter Controle</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-800 text-lg">Herstelwerkzaamheden</p>
          {userProfile.full_name && <p className="text-xs text-gray-400">{userProfile.full_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('profile')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1.5 rounded-lg"
            title="Mijn Profiel">
            <User size={14} />
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">
            <LogOut size={14} /> Uitloggen
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {loadingInspections ? (
          <p className="text-center text-gray-400 mt-10 italic">Laden...</p>
        ) : inspections.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-gray-500 font-medium">Geen toegewezen werkzaamheden</p>
            <p className="text-gray-400 text-sm mt-1">Je hebt momenteel geen inspecties toegewezen gekregen.</p>
            <button onClick={fetchInspections} className="mt-4 text-sm text-emerald-600 underline">Vernieuwen</button>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map(row => {
              const defects  = row.report_data.defects || [];
              const repaired = defects.filter(d => d.isRepaired).length;
              return (
                <div key={row.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-800 truncate flex-1">{row.report_data.meta.clientName}</p>
                    {statusBadge(row.status)}
                  </div>
                  <p className="text-xs text-gray-500">{row.report_data.meta.projectAddress}, {row.report_data.meta.projectCity}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-gray-400">{row.inspection_number || `#${row.id}`} · {new Date(row.created_at).toLocaleDateString('nl-NL')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{defects.length} gebreken · {repaired} hersteld</p>
                    </div>
                    <button onClick={() => handleOpenInspection(row)}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition">
                      {row.status === 'ter_controle' ? 'Bekijken' : 'Open →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Helper components for Basisgegevens ----

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-gray-100 px-3 py-1.5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium flex-1 break-words">{value || '-'}</span>
    </div>
  );
}
