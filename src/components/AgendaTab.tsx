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

interface AgendaTabProps {
  inspections: any[];
  onEdit: (insp: any) => void;
  onReschedule: (id: number, newDate: string, newTime: string, newDurationHours?: number) => Promise<void>;
}

export default function AgendaTab({ inspections, onEdit, onReschedule }: AgendaTabProps) {
  const [view, setView] = useState<string>(Views.WEEK);
  const [date, setDate] = useState(new Date());

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
        };
      });
  }, [inspections]);

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

  // Ongeplande inspecties (geen datum of geen tijdstip ingesteld)
  const unplanned = useMemo(() => {
    return inspections.filter(insp => {
      const meta = insp.report_data?.meta;
      return !meta?.date;
    });
  }, [inspections]);

  // Legende
  const legend = useMemo(() => {
    const entries: { name: string; color: string }[] = [];
    colorMap.forEach((color, name) => { if (name) entries.push({ name, color }); });
    return entries;
  }, [colorMap]);

  return (
    <div className="flex flex-col gap-4">
      {/* Legende inspecteurs */}
      {legend.length > 0 && (
        <div className="flex flex-wrap gap-3 bg-white rounded-lg p-3 shadow-sm border">
          <span className="text-xs font-bold text-gray-500 uppercase self-center mr-1">Inspecteurs:</span>
          {legend.map(({ name, color }) => (
            <span key={name} className="flex items-center gap-1.5 text-sm">
              <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {name}
            </span>
          ))}
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

      {/* Kalender */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: '700px' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
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
    </div>
  );
}
