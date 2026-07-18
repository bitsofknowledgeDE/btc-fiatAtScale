declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export function trackAffiliateClick(partner: string, source?: string) {
  window.plausible?.('Affiliate-Klick', {
    props: { partner, source: source ?? window.location.hostname },
  });
}

export function trackEmailSignup(language: string) {
  window.plausible?.('E-Mail-Signup', { props: { language } });
}

export function trackToolInteraction(tool: string, action = 'run') {
  window.plausible?.('Tool-Interaktion', { props: { tool, action } });
}
