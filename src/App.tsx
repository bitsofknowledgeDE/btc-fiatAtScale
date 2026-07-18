import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { trackToolInteraction } from './utils/analytics';
import { Hero } from './components/Hero';
import { SupplySnapshot } from './components/SupplySnapshot';
import { SupplyChart } from './components/SupplyChart';
import { ScaleVisualization } from './components/ScaleVisualization';
import { MoneyPrinterSimulation } from './components/MoneyPrinterSimulation';
import { InflationComparison } from './components/InflationComparison';
import { HalvingTimeline } from './components/HalvingTimeline';
import { FutureProjection } from './components/FutureProjection';
import { ComparisonTable } from './components/ComparisonTable';
import { Navbar, Footer } from './components/Layout';
import { LiveRaceProvider } from './context/LiveRaceContext';
import { BtcPriceProvider } from './context/BtcPriceContext';
import { BtcNetworkProvider } from './context/BtcNetworkContext';

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
        <LayoutGroup id="live-race">
          <div className="relative flex min-h-[100dvh] flex-col bg-bok-surface text-bok-text">
            <Navbar />
            <main className="relative flex-1">
              <Hero />
              <SupplySnapshot />
              <div id="supply">
                <SupplyChart />
              </div>
              <MoneyPrinterSimulation />
              <div id="scale">
                <ScaleVisualization />
              </div>
              <InflationComparison />
              <HalvingTimeline />
              <div id="projection">
                <FutureProjection />
              </div>
              <ComparisonTable />
            </main>
            <Footer />
          </div>
        </LayoutGroup>
        </LiveRaceProvider>
      </BtcNetworkProvider>
    </BtcPriceProvider>
  );
}

export default App;
