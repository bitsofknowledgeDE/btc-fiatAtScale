import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import * as Icons from 'lucide-react';
import { Scale } from 'lucide-react';
import { BokHeader } from '../../../../CI/web/BokHeader';
import { BokFooter } from '../../../../CI/web/BokFooter';
import { UsdPrintedLive } from './UsdPrintedLive';
import { OtherProjectsDropdown } from './OtherProjectsDropdown';
import { useLiveRace } from '../context/LiveRaceContext';
import { useSocialLinks } from '../hooks/useSocialLinks';

const navLinks = [
  { href: '#supply', label: 'Supply' },
  { href: '#scale', label: 'Scale' },
  { href: '#projection', label: 'Projection' },
];

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
          <AnimatePresence>
            {navCounterVisible && (
              <motion.div
                key="nav-usd-inline"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="hidden w-64 lg:block"
              >
                <UsdPrintedLive variant="nav" morphAmount />
              </motion.div>
            )}
          </AnimatePresence>

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

      <AnimatePresence>
        {navCounterVisible && (
          <motion.div
            key="nav-usd-mobile"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="border-b border-bok-border bg-white px-4 py-2 lg:hidden"
          >
            <div className="mx-auto max-w-6xl">
              <UsdPrintedLive variant="nav" morphAmount={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  const { socialLinks } = useSocialLinks();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : <Icons.ExternalLink className="h-5 w-5" />;
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
        <p className="text-xs text-slate-400">
          Data from Federal Reserve FRED and Bitcoin protocol specs. Projections follow historical trends.
        </p>
        <p className="text-xs leading-relaxed text-slate-400">
          For educational purposes only. Not financial advice. Always do your own research.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Bits of Knowledge. All rights reserved.
      </p>
    </BokFooter>
  );
}
