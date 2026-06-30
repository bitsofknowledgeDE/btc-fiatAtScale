import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ComponentType } from 'react';
import * as Icons from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { UsdPrintedLive } from './UsdPrintedLive';
import { OtherProjectsDropdown } from './OtherProjectsDropdown';
import { useLiveRace } from '../context/LiveRaceContext';
import { useSocialLinks } from '../hooks/useSocialLinks';

const navLinks = [
  { href: '#supply', label: 'Supply' },
  { href: '#scale', label: 'Scale' },
  { href: '#projection', label: 'Projection' },
];

const wordmarkStyle = {
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  letterSpacing: '-0.02em',
} as const;

const pillStyle = {
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  letterSpacing: '0.1em',
} as const;

export function Navbar() {
  const reduceMotion = useReducedMotion();
  const { navCounterVisible } = useLiveRace();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="spectrum-bar h-1" aria-hidden="true" />
      <div className="bok-header-shell">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 min-h-[4.25rem] py-2">
            <a href="#" className="flex items-center gap-2.5 min-w-0 shrink-0 group">
              <BrandLogo size="sm" animate={!reduceMotion} />
              <div className="min-w-0 hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-midnight-100 truncate" style={wordmarkStyle}>
                    fiat<span className="text-btc-orange">At</span>Scale
                  </span>
                  <span
                    className="hidden lg:inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shrink-0 text-btc-orange bg-btc-orange/10"
                    style={pillStyle}
                  >
                    Supply Visualizer
                  </span>
                </div>
                <p className="text-[11px] text-bok-muted mt-0.5 truncate hidden md:block">
                  Live monetary divergence
                  <a
                    href="https://bitsofknowledge.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-bold text-midnight-300 hover:text-btc-orange transition-colors"
                    style={{ ...pillStyle, letterSpacing: '0.08em' }}
                  >
                    · A BITS OF KNOWLEDGE TOOL
                  </a>
                </p>
              </div>
            </a>

            <AnimatePresence>
              {navCounterVisible && (
                <motion.div
                  key="nav-usd-inline"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 hidden md:block"
                >
                  <UsdPrintedLive variant="nav" morphAmount />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1 ml-auto shrink-0">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm text-bok-muted hover:text-midnight-100 rounded-lg transition-colors duration-200 hover:bg-midnight-900 hidden sm:block"
                >
                  {link.label}
                </a>
              ))}
              <OtherProjectsDropdown />
            </div>
          </div>

          <AnimatePresence>
            {navCounterVisible && (
              <motion.div
                key="nav-usd-mobile"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="md:hidden pb-3"
              >
                <UsdPrintedLive variant="nav" morphAmount={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

export function Footer() {
  const { socialLinks } = useSocialLinks();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : <Icons.ExternalLink className="w-5 h-5" />;
  };

  return (
    <footer className="relative mt-auto bg-bok-surface border-t border-bok-border">
      <div className="spectrum-bar absolute top-0 left-0 right-0 h-[3px]" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pt-14">
        <div className="flex flex-col items-center gap-6">
          <a
            href="https://bitsofknowledge.de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo_icon.png"
              alt="Bits of Knowledge Logo"
              className="w-10 h-10 rounded-lg object-contain transition-transform duration-300 group-hover:rotate-12"
            />
            <div className="text-left">
              <div
                className="text-sm font-bold text-midnight-100 tracking-widest"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                BITS OF KNOWLEDGE
              </div>
              <div className="text-xs font-semibold text-btc-orange">Bitcoin & Souveränität</div>
            </div>
          </a>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-bok-border bg-midnight-900 hover:bg-btc-orange/10 hover:border-btc-orange/30 flex items-center justify-center transition-colors group"
                  aria-label={link.label}
                >
                  <span className="text-bok-muted group-hover:text-btc-orange transition-colors">
                    {getIcon(link.icon_name)}
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="text-center max-w-2xl space-y-2">
            <p className="text-xs text-bok-muted">
              Data from Federal Reserve FRED and Bitcoin protocol specs. Projections follow historical trends.
            </p>
            <p className="text-xs text-bok-muted leading-relaxed">
              For educational purposes only. Not financial advice. Always do your own research.
            </p>
          </div>

          <p className="text-xs text-midnight-600">
            &copy; {new Date().getFullYear()} Bits of Knowledge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
