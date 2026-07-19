import { BokFaq, type FaqItem } from '../../../../CI/web/BokFaq';

/** FAQ-Inhalte dieser Site. Muss identisch im statischen Fallback
 *  (index.html) und im FAQPage-JSON-LD stehen. */
const items: FaqItem[] = [
  { q: "What is fiatAtScale showing me?", a: "Dollar money-supply expansion set against Bitcoin's fixed 21 million cap. A live counter estimates how many dollars have been created and how much Bitcoin has been mined since you opened the page, alongside the ratio between them." },
  { q: "What is M2 and why use it?", a: "M2 is a broad measure of the US money supply covering cash, deposits and easily accessible savings. It is the standard yardstick for how much money exists, which makes it the fair comparison against Bitcoin's supply schedule." },
  { q: "Where does the data come from?", a: "US money-supply figures come from FRED, the Federal Reserve's public data service. Bitcoin's supply follows the protocol's fixed issuance schedule, and the inflation view uses Truflation CPI." },
  { q: "What does the projection to 2050 assume?", a: "It extends the historical M2 trend to roughly $85 trillion by 2050 while Bitcoin approaches its 21 million limit. The dollar side is a trend extrapolation and could be wrong. The Bitcoin side is defined by the protocol and is the only genuinely fixed number in the chart." },
  { q: "Why do the halving details matter here?", a: "Because they are the mechanism behind the flattening supply curve. Every four years Bitcoin's issuance rate halves, so the chart shows the dates, block rewards and annual issuance rates that produce it." },
];

export function FaqSection() {
  return <BokFaq items={items} />;
}

export default FaqSection;
