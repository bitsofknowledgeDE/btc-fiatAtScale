import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OtherProject {
  id: string;
  name: string;
  url: string;
  beschreibung: string | null;
}

export function useOtherProjects() {
  const [projects, setProjects] = useState<OtherProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('global_other_projects')
          .select('id, name, url, beschreibung')
          .eq('aktiv', true)
          .order('reihenfolge', { ascending: true });

        if (error) throw error;
        if (!cancelled) setProjects(data ?? []);
      } catch (error) {
        console.error('Error fetching other projects:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading };
}
