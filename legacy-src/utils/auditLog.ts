import { supabase } from '../supabase';

export type AuditApp = 'admin' | 'inspector' | 'installer';

export const ACTION_LABELS: Record<string, string> = {
  inspection_created:          'Inspectie aangemaakt',
  inspection_updated:          'Inspectie bijgewerkt',
  inspection_deleted:          'Inspectie verwijderd',
  inspection_finalized:        'Inspectie afgerond',
  inspection_rescheduled:      'Inspectie verplaatst',
  inspection_status_changed:   'Status gewijzigd',
  repair_submitted:            'Herstel ingediend',
  repair_approved:             'Herstel goedgekeurd',
  repair_rejected:             'Herstel afgekeurd',
  installer_assigned:          'Installateur toegewezen',
  client_created:              'Klant aangemaakt',
  client_updated:              'Klant bijgewerkt',
  client_deleted:              'Klant verwijderd',
  user_company_updated:        'Bedrijfsgegevens bijgewerkt',
  profile_updated:             'Profiel bijgewerkt',
  settings_company_updated:    'Inspectiebedrijf bijgewerkt',
  settings_instrument_added:   'Instrument toegevoegd',
  settings_instrument_removed: 'Instrument verwijderd',
};

// Module-level cache — one profile lookup per browser session
let _cachedUserId: string | null = null;
let _cachedUserName: string | null = null;

async function resolveUser(): Promise<{ userId: string; userName: string } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  if (_cachedUserId === session.user.id && _cachedUserName) {
    return { userId: _cachedUserId, userName: _cachedUserName };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', session.user.id)
    .single();

  _cachedUserId = session.user.id;
  _cachedUserName = profile?.full_name || session.user.email || 'Onbekend';

  return { userId: _cachedUserId, userName: _cachedUserName };
}

/**
 * Log een gebruikersactie naar de audit_log tabel.
 * Faalt stil zodat de hoofdflow nooit onderbroken wordt.
 */
export const logAction = async (
  app: AuditApp,
  action: string,
  entityType: string,
  entityId: string | number | null,
  entityLabel: string,
  details?: Record<string, any>,
): Promise<void> => {
  try {
    const user = await resolveUser();
    if (!user) return;

    await supabase.from('audit_log').insert({
      user_id:      user.userId,
      user_name:    user.userName,
      action,
      entity_type:  entityType,
      entity_id:    entityId != null ? String(entityId) : null,
      entity_label: entityLabel,
      details:      details ?? null,
      app,
    });
  } catch {
    // Nooit de hoofdflow onderbreken
  }
};
