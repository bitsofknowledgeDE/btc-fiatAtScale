import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { trackToolInteraction } from './utils/analytics';
import { Cockpit } from './components/Cockpit';
import { Navbar, Footer } from './components/Layout';
import { LiveRaceProvider } from './context/LiveRaceContext';
import { BtcPriceProvider } from './context/BtcPriceContext';
import { BtcNetworkProvider } from './context/BtcNetworkContext';

/**
 * Everything below the first viewport is code-split (WP-2.4). The cockpit is
 * the only thing the first paint needs; the canvas simulation, the recharts
 * inflation chart and the long-form sections arrive in their own chunks. The
 * site used to ship one ~1.54 MB chunk.
 */
const MoneyPrinterSimulation = lazy(() => import('./components/MoneyPrinterSimulation'));
const ScaleVisualization = lazy(() => import('./components/ScaleVisualization'));
const InflationComparison = lazy(() => import('./components/InflationComparison'));
const HalvingTimeline = lazy(() => import('./components/HalvingTimeline'));
const ComparisonTable = lazy(() => import('./components/ComparisonTable'));
const FaqSection = lazy(() => import('./components/FaqSection'));

/** Reserves roughly the section height so nothing jumps when a chunk lands. */
function SectionFallback({ surface = false }: { surface?: boolean }) {
  return (
    <div
      className={`px-4 py-16 sm:py-20 ${surface ? 'bg-bok-surface' : ''}`}
      aria-hidden="true"
    >
      <div className="mx-auto max-w-6xl">
        <div className="h-4 w-28 rounded bg-bok-border" />
        <div className="mt-4 h-8 w-72 max-w-full rounded bg-bok-border/70" />
        <div className="mt-8 h-48 rounded-bok border border-bok-border bg-bok-card" />
      </div>
    </div>
  );
}

/**
 * `React.lazy` alone starts every dynamic import the moment the tree mounts,
 * so recharts (368 KB) would still be fetched during the first paint. This
 * wrapper only mounts its child once the placeholder comes within 800 px of
 * the viewport — far enough ahead that the section is ready before it is
 * reached, and tall-viewport renderers (Googlebot) still resolve everything.
 */
function Deferred({
  children,
  id,
  surface = false,
}: {
  children: ReactNode;
  id?: string;
  surface?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [show]);

  return (
    <div ref={ref} id={id}>
      {show ? (
        <Suspense fallback={<SectionFallback surface={surface} />}>{children}</Suspense>
      ) : (
        <SectionFallback surface={surface} />
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    const onInteract = () => trackToolInteraction('fiatatscale', 'interact');
    document.addEventListener('pointerdown', onInteract, { once: true });
    return () => document.removeEventListener('pointerdown', onInteract);
  }, []);

  return (
    <BtcPriceProvider>
      <BtcNetworkProvider>
        <LiveRaceProvider>
          <div className="relative flex min-h-[100dvh] flex-col bg-bok-surface text-bok-text">
            <Navbar />
            <main className="relative flex-1">
              <Cockpit />
              <Deferred id="emission" surface>
                <MoneyPrinterSimulation />
              </Deferred>
              <Deferred id="scale">
                <ScaleVisualization />
              </Deferred>
              <Deferred id="inflation" surface>
                <InflationComparison />
              </Deferred>
              <Deferred>
                <HalvingTimeline />
              </Deferred>
              <Deferred>
                <ComparisonTable />
              </Deferred>
            </main>
            {/* The FAQ stays eagerly mounted: its wording has to be in the DOM
                for the FAQPage JSON-LD it mirrors. */}
            <Suspense fallback={<SectionFallback />}>
              <FaqSection />
            </Suspense>
            <Footer />
          </div>
        </LiveRaceProvider>
      </BtcNetworkProvider>
    </BtcPriceProvider>
  );
}

export default App;
