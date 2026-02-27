import { useEffect, useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { LogOut, ArrowLeft, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Defect, InspectionDbRow } from './types';
import { compressImage, uploadPhotoToCloud } from './utils';
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

export default function InstallerApp({ supabase, userId, onLogout }: InstallerAppProps) {
  const [installerName, setInstallerName] = useState('');
  const [inspections, setInspections] = useState<InspectionDbRow[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<InspectionDbRow | null>(null);
  const [currentDefectIndex, setCurrentDefectIndex] = useState(0);
  const [localDefects, setLocalDefects] = useState<Defect[]>([]);
  const [showSignature, setShowSignature] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingInspections, setLoadingInspections] = useState(true);

  const sigPad = useRef<SignatureCanvas>(null);
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchInspections();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    if (data) setInstallerName(data.full_name || '');
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

  const handleOpenInspection = (row: InspectionDbRow) => {
    setSelectedInspection(row);
    setLocalDefects([...row.report_data.defects]);
    setCurrentDefectIndex(0);
    setShowSignature(false);
  };

  const handleBack = () => {
    setSelectedInspection(null);
    setShowSignature(false);
  };

  const updateCurrentDefect = (changes: Partial<Defect>) => {
    setLocalDefects(prev =>
      prev.map((d, i) => (i === currentDefectIndex ? { ...d, ...changes } : d))
    );
  };

  const handlePhotoUpload = async (slot: 1 | 2, file: File) => {
    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 'defect');
      const url = await uploadPhotoToCloud(compressed);
      if (url) {
        if (slot === 1) updateCurrentDefect({ repairPhotoUrl1: url });
        else updateCurrentDefect({ repairPhotoUrl2: url });
      }
    } catch {
      alert('Fout bij uploaden foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedInspection) return;
    if (sigPad.current?.isEmpty()) {
      alert('Zet uw handtekening om in te dienen.');
      return;
    }
    setIsSaving(true);
    const sigData = sigPad.current?.getCanvas().toDataURL('image/png');
    const updatedReportData = {
      ...selectedInspection.report_data,
      defects: localDefects,
      meta: {
        ...selectedInspection.report_data.meta,
        installerSignature: sigData,
        installerName: installerName,
        repairDate: new Date().toISOString().split('T')[0],
      },
    };
    const { error } = await supabase
      .from('inspections')
      .update({ report_data: updatedReportData, status: 'ter_controle' })
      .eq('id', selectedInspection.id);
    setIsSaving(false);
    if (error) {
      alert('Fout bij indienen: ' + error.message);
      return;
    }
    setSelectedInspection(null);
    setShowSignature(false);
    fetchInspections();
  };

  const allRepaired = localDefects.length > 0 && localDefects.every(d => d.isRepaired === true);
  const repairedCount = localDefects.filter(d => d.isRepaired).length;
  const currentDefect = localDefects[currentDefectIndex];
  const isLastDefect = currentDefectIndex === localDefects.length - 1;
  const isFirstDefect = currentDefectIndex === 0;
  const cs = currentDefect
    ? (CLASSIFICATION_STYLE[currentDefect.classification] ?? CLASSIFICATION_STYLE['Blue'])
    : null;

  // --- SCREEN: SIGNATURE ---
  if (selectedInspection && showSignature) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowSignature(false)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} /> Terug
          </button>
          <span className="font-bold text-gray-800">Handtekening plaatsen</span>
          <div />
        </header>

        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-xl shadow p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Installateur</p>
                <p className="font-semibold text-gray-800">{installerName}</p>
              </div>
              <div>
                <p className="text-gray-400">Datum herstel</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('nl-NL')}</p>
              </div>
              <div>
                <p className="text-gray-400">Gebreken hersteld</p>
                <p className="font-semibold text-gray-800">{repairedCount} van {localDefects.length}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium">Handtekening</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                  ref={sigPad}
                  canvasProps={{ className: 'w-full', height: 200 }}
                  backgroundColor="white"
                  penColor="black"
                />
              </div>
              <button
                onClick={() => sigPad.current?.clear()}
                className="mt-1 text-xs text-red-500 underline"
              >
                Wissen
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 text-sm"
            >
              {isSaving ? 'Bezig met indienen...' : 'Bevestigen & Indienen ✓'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN: DEFECT WALKTHROUGH ---
  if (selectedInspection && currentDefect) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} /> Terug
          </button>
          <span className="font-bold text-gray-800 truncate max-w-[60%]">
            {selectedInspection.report_data.meta.clientName}
          </span>
          <span className="text-sm text-gray-400">{currentDefectIndex + 1}/{localDefects.length}</span>
        </header>

        {/* Progress bar */}
        <div className="bg-white border-b">
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-1.5 bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentDefectIndex + 1) / localDefects.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-400 py-1.5">
            Gebrek {currentDefectIndex + 1} van {localDefects.length} — {repairedCount} hersteld
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 max-w-lg mx-auto w-full">
          {/* Defect card */}
          <div
            className="bg-white rounded-xl shadow border-l-4 p-4"
            style={{ borderColor: cs?.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${cs?.badge}`}>{cs?.label}</span>
              {currentDefect.isRepaired && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  ✓ Hersteld
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-800">{currentDefect.location}</p>
            <p className="text-sm text-gray-600 mt-1">{currentDefect.description}</p>
            {currentDefect.category && (
              <p className="text-xs text-gray-400 mt-1">
                {currentDefect.category}
                {currentDefect.subcategory ? ` › ${currentDefect.subcategory}` : ''}
              </p>
            )}
          </div>

          {/* Original photos */}
          {(currentDefect.photoUrl || currentDefect.photoUrl2) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Oorspronkelijke foto('s)</p>
              <div className="flex gap-2 flex-wrap">
                {currentDefect.photoUrl && (
                  <img
                    src={currentDefect.photoUrl}
                    className="h-28 w-28 object-cover rounded-lg border"
                    alt="Foto gebrek"
                  />
                )}
                {currentDefect.photoUrl2 && (
                  <img
                    src={currentDefect.photoUrl2}
                    className="h-28 w-28 object-cover rounded-lg border"
                    alt="Foto gebrek 2"
                  />
                )}
              </div>
            </div>
          )}

          {/* Repair section */}
          <div className="bg-white rounded-xl shadow p-4 space-y-4">
            <p className="font-semibold text-gray-700 text-sm border-b pb-2">Herstelregistratie</p>

            {/* Photo 1 */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">Foto herstel</p>
              {currentDefect.repairPhotoUrl1 ? (
                <div className="flex items-center gap-3">
                  <img
                    src={currentDefect.repairPhotoUrl1}
                    className="h-20 w-20 object-cover rounded-lg border"
                    alt="Herstel foto"
                  />
                  <button
                    onClick={() => updateCurrentDefect({ repairPhotoUrl1: undefined })}
                    className="text-xs text-red-500 underline"
                  >
                    Verwijderen
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInput1Ref}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handlePhotoUpload(1, e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInput1Ref.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 text-sm text-emerald-700 border border-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Foto uploaden'}
                  </button>
                </>
              )}
            </div>

            {/* Photo 2 */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">Tweede foto (optioneel)</p>
              {currentDefect.repairPhotoUrl2 ? (
                <div className="flex items-center gap-3">
                  <img
                    src={currentDefect.repairPhotoUrl2}
                    className="h-20 w-20 object-cover rounded-lg border"
                    alt="Herstel foto 2"
                  />
                  <button
                    onClick={() => updateCurrentDefect({ repairPhotoUrl2: undefined })}
                    className="text-xs text-red-500 underline"
                  >
                    Verwijderen
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInput2Ref}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handlePhotoUpload(2, e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInput2Ref.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 text-sm text-gray-500 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Tweede foto uploaden'}
                  </button>
                </>
              )}
            </div>

            {/* Remarks */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">Herstelopmerking</p>
              <textarea
                value={currentDefect.repairRemarks || ''}
                onChange={(e) => updateCurrentDefect({ repairRemarks: e.target.value })}
                rows={3}
                placeholder="Beschrijf wat er gedaan is..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            {/* Repaired checkbox */}
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={currentDefect.isRepaired === true}
                onChange={(e) => updateCurrentDefect({ isRepaired: e.target.checked })}
                className="w-5 h-5 rounded accent-emerald-600"
              />
              <span className="font-semibold text-gray-800 text-sm">Markeer als hersteld ✓</span>
            </label>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setCurrentDefectIndex(i => i - 1)}
            disabled={isFirstDefect}
            className="flex items-center gap-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Vorige
          </button>

          {isLastDefect ? (
            <button
              onClick={() => setShowSignature(true)}
              disabled={!allRepaired}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {allRepaired
                ? 'Afronden & Ondertekenen →'
                : `Nog ${localDefects.length - repairedCount} te herstellen`}
            </button>
          ) : (
            <button
              onClick={() => setCurrentDefectIndex(i => i + 1)}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-700 transition"
            >
              Volgende <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- SCREEN: OVERVIEW ---
  const statusBadge = (status: string) => {
    if (status === 'herstel_wacht')
      return (
        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
          Wacht op Herstel
        </span>
      );
    if (status === 'ter_controle')
      return (
        <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
          Ter Controle
        </span>
      );
    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{status}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-800 text-lg">Herstelwerkzaamheden</p>
          {installerName && <p className="text-xs text-gray-400">{installerName}</p>}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          <LogOut size={14} /> Uitloggen
        </button>
      </header>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {loadingInspections ? (
          <p className="text-center text-gray-400 mt-10 italic">Laden...</p>
        ) : inspections.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-gray-500 font-medium">Geen toegewezen werkzaamheden</p>
            <p className="text-gray-400 text-sm mt-1">
              Je hebt momenteel geen inspecties toegewezen gekregen.
            </p>
            <button onClick={fetchInspections} className="mt-4 text-sm text-emerald-600 underline">
              Vernieuwen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((row) => {
              const defects = row.report_data.defects || [];
              const repaired = defects.filter(d => d.isRepaired).length;
              const isSubmitted = row.status === 'ter_controle';
              return (
                <div
                  key={row.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-800 truncate flex-1">
                      {row.report_data.meta.clientName}
                    </p>
                    {statusBadge(row.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {row.report_data.meta.projectAddress}, {row.report_data.meta.projectCity}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-gray-400">
                        {row.inspection_number || `#${row.id}`} ·{' '}
                        {new Date(row.created_at).toLocaleDateString('nl-NL')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {defects.length} gebreken · {repaired} hersteld
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenInspection(row)}
                      disabled={isSubmitted}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-default transition"
                    >
                      {isSubmitted ? 'Ingediend' : 'Open →'}
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
