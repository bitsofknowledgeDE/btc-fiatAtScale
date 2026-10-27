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

// Tool-Interaktion counts real use: nothing is sent before the visitor's first
// gesture (effects that run on load or when live data arrives are not use), and
// each tool + action is sent at most once per page view.
let hasGesture = false;
const sentToolActions = new Set<string>();

if (typeof window !== 'undefined') {
  const markGesture = () => {
    hasGesture = true;
  };
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
    window.addEventListener(type, markGesture, { capture: true, once: true, passive: true });
  }
}

export function trackToolInteraction(tool: string, action = 'run') {
  if (!hasGesture) return;
  const key = `${tool}:${action}`;
  if (sentToolActions.has(key)) return;
  sentToolActions.add(key);
  window.plausible?.('Tool-Interaktion', { props: { tool, action } });
}
