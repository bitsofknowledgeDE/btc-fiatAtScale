import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, LayoutGrid } from 'lucide-react';
import { useOtherProjects } from '../hooks/useOtherProjects';

export function OtherProjectsDropdown() {
  const [open, setOpen] = useState(false);
  const { projects, loading } = useOtherProjects();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (loading || projects.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-lg border border-bok-border bg-white px-3 py-1.5 text-sm font-medium text-bok-muted transition-colors duration-200 hover:border-bitcoin-orange/30 hover:bg-bok-surface hover:text-bok-text"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <LayoutGrid className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
        <span className="hidden sm:inline">Other Projects</span>
        <span className="sm:hidden">More</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-bok-border bg-white shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-bok-border px-3 py-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest text-bok-muted"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              More from Bits of Knowledge
            </p>
          </div>
          <div className="py-1">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-bok-surface"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bitcoin-orange/10 ring-1 ring-bitcoin-orange/20">
                  <ExternalLink
                    className="h-3 w-3 text-bitcoin-orange/80 transition-colors group-hover:text-bitcoin-orange"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-bok-text group-hover:text-bitcoin-orange">
                    {project.name}
                  </div>
                  {project.beschreibung && (
                    <div className="truncate text-xs text-bok-muted">{project.beschreibung}</div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
