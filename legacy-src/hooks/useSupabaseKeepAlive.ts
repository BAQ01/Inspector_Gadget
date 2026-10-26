import { useEffect, useRef } from 'react';
import { supabase } from '../supabase';

/**
 * Keep-alive hook: voorkomt dat het Supabase free-tier project
 * automatisch wordt gepauzeerd wegens inactiviteit.
 *
 * Stuurt elke INTERVAL_MS een lichtgewicht query naar de database.
 * Dit telt als "activiteit" voor Supabase.
 *
 * Backup voor de GitHub Actions cron job (.github/workflows/supabase-keepalive.yml).
 */

const INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 uur

export function useSupabaseKeepAlive() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ping = async () => {
      try {
        // Lichtgewicht HEAD-achtige query: haal alleen 1 id op
        const { error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (error) {
          console.warn('[KeepAlive] Ping mislukt:', error.message);
        } else {
          console.debug('[KeepAlive] Supabase ping OK', new Date().toISOString());
        }
      } catch (err) {
        console.warn('[KeepAlive] Netwerk-fout:', err);
      }
    };

    // Direct pingen bij mount
    ping();

    // Herhaal elke 4 uur
    intervalRef.current = setInterval(ping, INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
