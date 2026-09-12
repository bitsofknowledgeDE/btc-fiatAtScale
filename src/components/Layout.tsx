import type { ComponentType } from 'react';
import {
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Rss,
  Scale,
  Send,
  Share2,
  Twitter,
  Youtube,
} from 'lucide-react';
import { BokHeader } from '../../../../CI/web/BokHeader';
import { BokFooter } from '../../../../CI/web/BokFooter';
import { UsdPrintedLive } from './UsdPrintedLive';
import { OtherProjectsDropdown } from './OtherProjectsDropdown';
import { useLiveRace } from '../context/LiveRaceContext';
import { useSocialLinks } from '../hooks/useSocialLinks';

const navLinks = [
  { href: '#emission', label: 'Emission' },
  { href: '#scale', label: 'Scale' },
  { href: '#inflation', label: 'Inflation' },
];

/**
 * Explicit icon map. A `import * as Icons from 'lucide-react'` used to pull the
 * whole library into the bundle for four social links (the same finding as on
 * btc-realATH, WP-2.4).
 */
const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Youtube,
  Twitter,
  Globe,
  Share2,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Rss,
  Send,
};

export function Navbar() {
  const { navCounterVisible } = useLiveRace();

  return (
    <>
      <BokHeader
        icon={Scale}
        title={<>fiat<span className="text-bitcoin-orange">At</span>Scale</>}
        toolType="VISUALIZER"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            className={`hidden transition-opacity duration-200 lg:block ${
              navCounterVisible ? 'w-64 opacity-100' : 'pointer-events-none w-0 opacity-0'
            }`}
            aria-hidden={!navCounterVisible}
          >
            {navCounterVisible && <UsdPrintedLive />}
          </div>

          <nav className="hidden items-center sm:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-1.5 text-sm text-bok-muted transition-colors hover:bg-bok-surface hover:text-bok-text"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <OtherProjectsDropdown />
        </div>
      </BokHeader>

      {navCounterVisible && (
        <div className="border-b border-bok-border bg-bok-card px-4 py-2 lg:hidden">
          <div className="mx-auto max-w-6xl">
            <UsdPrintedLive />
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const { socialLinks } = useSocialLinks();

  const getIcon = (iconName: string) => {
    const Icon = SOCIAL_ICONS[iconName] ?? ExternalLink;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <BokFooter domain="fiatatscale.com" lang="en">
      {socialLinks.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-bitcoin-orange"
              aria-label={link.label}
            >
              {getIcon(link.icon_name)}
            </a>
          ))}
        </div>
      )}

      <div className="mx-auto mt-8 max-w-2xl space-y-2 text-center">
        <p className="text-xs text-white/55">
          US money-supply figures from the Federal Reserve (FRED); Bitcoin supply from the
          protocol issuance schedule. Everything past the last reported year is a scenario, not
          a forecast.
        </p>
        <p className="text-xs leading-relaxed text-white/55">
          For educational purposes only. Not financial advice. Always do your own research.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} Bits of Knowledge. All rights reserved.
      </p>
    </BokFooter>
  );
}
