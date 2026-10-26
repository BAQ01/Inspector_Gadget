import React, { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import {
  format, parse, startOfWeek, getDay,
  addHours, parseISO, setHours, setMinutes,
} from 'date-fns';
import { nl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Map as MapIcon, Navigation, Waypoints } from 'lucide-react';
import { haversine, nearestNeighbor, assignTimes, type RoutableStop } from '../utils/routing';
import { geocodeAddress } from '../utils/placesSearch';

// Fix Leaflet default icon in Vite/bundler environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const DnDCalendar = withDragAndDrop(Calendar as any) as any;

const locales = { nl };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => startOfWeek(d, { locale: nl }),
  getDay,
  locales,
});

const INSPECTOR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

function buildColorMap(inspectorNames: string[]): Map<string, string> {
  const map = new Map<string, string>();
  [...new Set(inspectorNames.filter(Boolean))].forEach((name, i) => {
    map.set(name, INSPECTOR_COLORS[i % INSPECTOR_COLORS.length]);
  });
  return map;
}

const makeColoredIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
  });

const GREY_ICON = makeColoredIcon('#9CA3AF');

function mapsUrl(meta: any): string {
  const dest = [meta?.projectAddress, meta?.projectPostalCode, meta?.projectCity]
    .filter(Boolean).join(' ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

interface AgendaTabProps {
  inspections: any[];
  users: any[];
  onEdit: (insp: any) => void;
  onReschedule: (id: number, newDate: string, newTime: string, newDurationHours?: number) => Promise<void>;
}

export default function AgendaTab({ inspections, users, onEdit, onReschedule }: AgendaTabProps) {
  const [view, setView] = useState<string>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showMap, setShowMap] = useState(false);
  const [optimizeInspector, setOptimizeInspector] = useState('');
  const [optimizeResult, setOptimizeResult] = useState<any[] | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Inspecteur kleurenkaart
  const colorMap = useMemo(() => {
    const names = inspections.map(i => i.report_data?.meta?.inspectorName || '');
    return buildColorMap(names);
  }, [inspections]);

  // Converteer inspecties naar kalendergebeurtenissen
  const events = useMemo(() => {
    return inspections
      .filter(insp => insp.report_data?.meta?.date)
      .map(insp => {
        const meta = insp.report_data.meta;
        const dateStr = meta.date as string;
        const timeStr: string = meta.scheduledTimeStart || '09:00';
        const durationH: number = meta.estimatedDurationHours ?? 4;

        let base: Date;
        try {
          base = parseISO(dateStr);
        } catch {
          base = new Date();
        }
        const [h, m] = timeStr.split(':').map(Number);
        const start = setMinutes(setHours(base, h || 9), m || 0);
        const end = addHours(start, durationH);

        return {
          id: insp.id,
          title: `${meta.clientName || '—'}${meta.projectLocation ? ' · ' + meta.projectLocation : ''}`,
          start,
          end,
          resource: insp,
          inspectorName: meta.inspectorName || '',
          resourceId: meta.inspectorName || 'Onbekend',
        };
      });
  }, [inspections]);

  // Resources voor dag-weergave (inspecteurs als kolommen)
  const resources = useMemo(() => {
    const names: string[] = [];
    colorMap.forEach((_, name) => { if (name) names.push(name); });
    return names.map(name => ({ id: name, title: name }));
  }, [colorMap]);

  const eventStyleGetter = useCallback((event: any) => {
    const color = colorMap.get(event.inspectorName) || '#6B7280';
    return {
      style: {
        backgroundColor: color,
        borderLeft: `3px solid rgba(0,0,0,0.2)`,
        color: 'white',
        borderRadius: '3px',
        fontSize: '12px',
        padding: '1px 4px',
      },
    };
  }, [colorMap]);

  const handleSelectEvent = useCallback((event: any) => {
    onEdit(event.resource);
  }, [onEdit]);

  const handleEventDrop = useCallback(async ({ event, start }: any) => {
    const newDate = format(new Date(start), 'yyyy-MM-dd');
    const newTime = format(new Date(start), 'HH:mm');
    await onReschedule(event.id, newDate, newTime);
  }, [onReschedule]);

  const handleEventResize = useCallback(async ({ event, start, end }: any) => {
    const newDate = format(new Date(start), 'yyyy-MM-dd');
    const newTime = format(new Date(start), 'HH:mm');
    const durationH = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    await onReschedule(event.id, newDate, newTime, durationH);
  }, [onReschedule]);

  // Ongeplande inspecties (geen datum)
  const unplanned = useMemo(() => {
    return inspections.filter(insp => !insp.report_data?.meta?.date);
  }, [inspections]);

  // Nabijgelegen suggesties (alleen in dagweergave)
  const nearbySuggestions = useMemo(() => {
    if (view !== Views.DAY) return [];
    const dateStr = format(date, 'yyyy-MM-dd');

    const plannedCoords = events
      .filter(ev => format(ev.start, 'yyyy-MM-dd') === dateStr)
      .map(ev => ({
        lat: ev.resource.report_data?.meta?.lat as number | undefined,
        lng: ev.resource.report_data?.meta?.lng as number | undefined,
      }))
      .filter((c): c is { lat: number; lng: number } => !!c.lat && !!c.lng);

    if (plannedCoords.length === 0) return [];

    return unplanned
      .filter(insp => insp.report_data?.meta?.lat && insp.report_data?.meta?.lng)
      .map(insp => {
        const { lat, lng } = insp.report_data.meta;
        const minDist = Math.min(...plannedCoords.map(c => haversine(c.lat, c.lng, lat, lng)));
        return { insp, distKm: Math.round(minDist) };
      })
      .filter(({ distKm }) => distKm <= 30)
      .sort((a, b) => a.distKm - b.distKm);
  }, [view, date, events, unplanned]);

  // Legende
  const legend = useMemo(() => {
    const entries: { name: string; color: string }[] = [];
    colorMap.forEach((color, name) => { if (name) entries.push({ name, color }); });
    return entries;
  }, [colorMap]);

  // NNH optimalisatie
  const handleOptimize = useCallback(async () => {
    setOptimizing(true);
    const userProfile = users.find(u => u.full_name === optimizeInspector);

    // Probeer eerst opgeslagen coördinaten, anders geocode thuisadres on-demand
    let homeLat: number | undefined = userProfile?.home_lat;
    let homeLng: number | undefined = userProfile?.home_lng;

    if ((!homeLat || !homeLng) && userProfile?.home_address) {
      const coords = await geocodeAddress(
        userProfile.home_address,
        userProfile.home_postal_code || '',
        userProfile.home_city || '',
      );
      if (coords) { homeLat = coords.lat; homeLng = coords.lng; }
    }

    if (!homeLat || !homeLng) {
      alert(`Geen thuisadres gevonden voor ${optimizeInspector}.\nSla het thuisadres op via Mijn Profiel in de Inspector app.`);
      setOptimizing(false);
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStops: RoutableStop[] = events
      .filter(ev =>
        ev.inspectorName === optimizeInspector &&
        format(ev.start, 'yyyy-MM-dd') === dateStr &&
        ev.resource.report_data?.meta?.lat &&
        ev.resource.report_data?.meta?.lng
      )
      .map(ev => ({
        id: ev.id,
        lat: ev.resource.report_data.meta.lat,
        lng: ev.resource.report_data.meta.lng,
        estimatedDurationHours: ev.resource.report_data.meta.estimatedDurationHours ?? 2,
        resource: ev.resource,
      }));

    if (dayStops.length < 2) {
      alert('Minimaal 2 geplande inspecties met coördinaten nodig om te optimaliseren.');
      setOptimizing(false);
      return;
    }
    const sorted = nearestNeighbor({ lat: homeLat, lng: homeLng }, dayStops);
    const withTimes = assignTimes(sorted);
    setOptimizeResult(withTimes);
    setOptimizing(false);
  }, [users, optimizeInspector, date, events]);

  // Kaart: pins voor geplande + ongeplande inspecties met coördinaten
  const plannedPins = useMemo(() => {
    return inspections.filter(insp =>
      insp.report_data?.meta?.lat &&
      insp.report_data?.meta?.lng &&
      insp.report_data?.meta?.date
    );
  }, [inspections]);

  const unplannedPins = useMemo(() => {
    return inspections.filter(insp =>
      insp.report_data?.meta?.lat &&
      insp.report_data?.meta?.lng &&
      !insp.report_data?.meta?.date
    );
  }, [inspections]);

  // Route polyline voor NNH resultaat
  const routePolyline = useMemo(() => {
    if (!optimizeResult) return null;
    return optimizeResult.map((stop: any) => [stop.lat, stop.lng] as [number, number]);
  }, [optimizeResult]);

  // Kaart center: gemiddelde van alle pins, of Nederland
  const mapCenter = useMemo((): [number, number] => {
    const all = [...plannedPins, ...unplannedPins];
    if (all.length === 0) return [52.2, 5.3];
    const avgLat = all.reduce((s, i) => s + i.report_data.meta.lat, 0) / all.length;
    const avgLng = all.reduce((s, i) => s + i.report_data.meta.lng, 0) / all.length;
    return [avgLat, avgLng];
  }, [plannedPins, unplannedPins]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg p-3 shadow-sm border">
        {/* Legende inspecteurs */}
        {legend.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Inspecteurs:</span>
            {legend.map(({ name, color }) => (
              <span key={name} className="flex items-center gap-1.5 text-sm">
                <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Kaart toggle */}
          <button
            onClick={() => setShowMap(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
          >
            <MapIcon size={14} /> {showMap ? 'Verberg kaart' : 'Toon kaart'}
          </button>

          {/* NNH: kies inspecteur */}
          <select
            value={optimizeInspector}
            onChange={e => { setOptimizeInspector(e.target.value); setOptimizeResult(null); }}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Kies inspecteur...</option>
            {legend.map(({ name }) => <option key={name} value={name}>{name}</option>)}
          </select>

          {/* NNH knop */}
          <button
            disabled={!optimizeInspector || optimizing}
            onClick={handleOptimize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Waypoints size={14} /> {optimizing ? 'Bezig...' : 'Optimaliseer dag'}
          </button>
        </div>
      </div>

      {/* Nabijgelegen suggesties (alleen in dagweergave) */}
      {nearbySuggestions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-bold text-green-700 uppercase mb-2">
            Nabijgelegen ongeplande klussen (binnen 30 km van vandaag)
          </p>
          <div className="flex flex-wrap gap-2">
            {nearbySuggestions.map(({ insp, distKm }) => (
              <button
                key={insp.id}
                onClick={() => onEdit(insp)}
                className="bg-white border border-green-200 rounded px-2 py-1 text-xs hover:bg-green-100 text-left"
              >
                <span className="font-bold">{insp.client_name || '—'}</span>
                <span className="text-green-600 ml-1">· {distKm} km</span>
                {insp.report_data?.meta?.projectLocation && (
                  <span className="text-gray-400 ml-1">· {insp.report_data.meta.projectLocation}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ongeplande inspecties */}
      {unplanned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-bold text-amber-700 uppercase mb-2">
            Ongepland ({unplanned.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unplanned.map(insp => (
              <button
                key={insp.id}
                onClick={() => onEdit(insp)}
                className="bg-white border border-amber-200 rounded px-2 py-1 text-xs hover:bg-amber-100 text-left"
              >
                <span className="font-bold">{insp.client_name || '—'}</span>
                {insp.report_data?.meta?.projectLocation && (
                  <span className="text-gray-500 ml-1">· {insp.report_data.meta.projectLocation}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kalender + Kaart naast elkaar */}
      <div className={`flex gap-4 ${showMap ? 'flex-row' : 'flex-col'}`}>
        {/* Kalender */}
        <div
          className="bg-white rounded-lg shadow-sm border overflow-hidden"
          style={{ height: '700px', flex: showMap ? '1 1 0' : undefined, width: showMap ? undefined : '100%' }}
        >
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            onView={(v: string) => { setView(v); setOptimizeResult(null); }}
            date={date}
            onNavigate={(d: Date) => { setDate(d); setOptimizeResult(null); }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', padding: '8px' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            resizable
            draggableAccessor={() => true}
            step={30}
            timeslots={2}
            min={setHours(new Date(), 7)}
            max={setHours(new Date(), 19)}
            // Resource view: inspecteurs naast elkaar in dagweergave
            {...(view === Views.DAY && resources.length > 1 ? {
              resources,
              resourceIdAccessor: 'resourceId',
              resourceTitleAccessor: 'title',
            } : {})}
            messages={{
              next: 'Volgende',
              previous: 'Vorige',
              today: 'Vandaag',
              month: 'Maand',
              week: 'Week',
              day: 'Dag',
              agenda: 'Lijst',
              date: 'Datum',
              time: 'Tijd',
              event: 'Inspectie',
              noEventsInRange: 'Geen inspecties in deze periode.',
              showMore: (count: number) => `+${count} meer`,
            }}
            culture="nl"
            formats={{
              dayHeaderFormat: (date: Date) => format(date, 'EEE d MMM', { locale: nl }),
              dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${format(start, 'd MMM', { locale: nl })} – ${format(end, 'd MMM yyyy', { locale: nl })}`,
              monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: nl }),
              agendaDateFormat: (date: Date) => format(date, 'EEE d MMM', { locale: nl }),
            }}
          />
        </div>

        {/* Kaartpaneel */}
        {showMap && (
          <div className="flex flex-col gap-3" style={{ width: '380px', flexShrink: 0 }}>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: '700px' }}>
              <MapContainer
                center={mapCenter}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Geplande pins */}
                {plannedPins.map(insp => {
                  const meta = insp.report_data.meta;
                  const color = colorMap.get(meta.inspectorName || '') || '#6B7280';
                  return (
                    <Marker
                      key={`p-${insp.id}`}
                      position={[meta.lat, meta.lng]}
                      icon={makeColoredIcon(color)}
                    >
                      <Popup>
                        <div className="text-sm min-w-[180px]">
                          <div className="font-bold mb-1">{meta.clientName || '—'}</div>
                          {meta.projectLocation && <div className="text-gray-600 text-xs mb-0.5">{meta.projectLocation}</div>}
                          <div className="text-gray-500 text-xs mb-0.5">{meta.projectAddress}, {meta.projectCity}</div>
                          {meta.inspectorName && <div className="text-xs text-blue-600 mb-1">{meta.inspectorName}</div>}
                          {meta.date && <div className="text-xs text-gray-400 mb-1">{meta.date}{meta.scheduledTimeStart ? ` · ${meta.scheduledTimeStart}` : ''}</div>}
                          <div className="flex gap-2 mt-1.5">
                            <button
                              onClick={() => onEdit(insp)}
                              className="text-xs px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              Bewerken
                            </button>
                            <a
                              href={mapsUrl(meta)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              <Navigation size={11} /> Navigeer
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Ongeplande pins (grijs) */}
                {unplannedPins.map(insp => {
                  const meta = insp.report_data.meta;
                  return (
                    <Marker
                      key={`u-${insp.id}`}
                      position={[meta.lat, meta.lng]}
                      icon={GREY_ICON}
                    >
                      <Popup>
                        <div className="text-sm min-w-[160px]">
                          <div className="font-bold mb-1">{meta.clientName || insp.client_name || '—'}</div>
                          <div className="text-amber-600 text-xs mb-1">Ongepland</div>
                          <div className="text-gray-500 text-xs mb-1">{meta.projectAddress}, {meta.projectCity}</div>
                          <button
                            onClick={() => onEdit(insp)}
                            className="text-xs px-2 py-0.5 bg-amber-100 rounded hover:bg-amber-200 w-full"
                          >
                            Inplannen
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* NNH route polyline */}
                {routePolyline && routePolyline.length > 1 && (
                  <Polyline positions={routePolyline} color="#2563EB" weight={2} dashArray="6 4" />
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>

      {/* NNH Optimalisatieresultaat */}
      {optimizeResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800 text-sm">
              Geoptimaliseerde route — {optimizeInspector} — {format(date, 'd MMM', { locale: nl })}
            </h3>
            <button onClick={() => setOptimizeResult(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <ol className="space-y-2">
            {optimizeResult.map((stop: any, i: number) => {
              const meta = stop.resource.report_data?.meta;
              const timeStr = `${String(stop.scheduledHour).padStart(2, '0')}:${String(stop.scheduledMinute).padStart(2, '0')}`;
              return (
                <li key={stop.id} className="flex items-start gap-3 bg-white rounded p-2 border border-blue-100">
                  <span className="font-bold text-blue-700 w-5 text-sm shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{timeStr} — {meta?.clientName || '—'}</div>
                    <div className="text-xs text-gray-500 truncate">{meta?.projectAddress}, {meta?.projectCity}</div>
                    {meta?.estimatedDurationHours && (
                      <div className="text-xs text-gray-400">{meta.estimatedDurationHours} uur</div>
                    )}
                  </div>
                  <a
                    href={mapsUrl(meta)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                    title="Navigeer"
                  >
                    <Navigation size={14} />
                  </a>
                </li>
              );
            })}
          </ol>
          <button
            onClick={async () => {
              const dateStr = format(date, 'yyyy-MM-dd');
              for (const stop of optimizeResult) {
                const timeStr = `${String(stop.scheduledHour).padStart(2, '0')}:${String(stop.scheduledMinute).padStart(2, '0')}`;
                await onReschedule(stop.id, dateStr, timeStr);
              }
              setOptimizeResult(null);
            }}
            className="mt-3 w-full py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Volgorde toepassen in agenda
          </button>
        </div>
      )}
    </div>
  );
}
