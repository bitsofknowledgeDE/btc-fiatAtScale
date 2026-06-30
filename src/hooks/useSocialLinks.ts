import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('global_social_links')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setSocialLinks(data ?? []);
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    })();
  }, []);

  return { socialLinks };
}
