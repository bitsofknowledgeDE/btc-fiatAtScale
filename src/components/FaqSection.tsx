import { BokFaq, type FaqItem } from '../../../../CI/web/BokFaq';

/** This site's FAQ content. The same wording must appear in the static
 *  crawler fallback and in the FAQPage JSON-LD (index.html) — Google requires
 *  structured data to mirror visible content. */
const items: FaqItem[] = [
  {
    q: 'What does fiatAtScale show me?',
    a: "How far the US dollar money supply runs ahead of Bitcoin's fixed 21 million cap. You set the chart window and an annual M2 growth rate; the chart replots both supplies and reports how much money supply exists per bitcoin at the chosen horizon. A live counter adds the dollars created and the bitcoin mined since you opened the page.",
  },
  {
    q: 'What is M2 and why use it?',
    a: "M2 is a broad measure of the US money supply covering cash, deposits and easily accessible savings. It is the standard yardstick for how much money exists, which makes it the fair comparison against Bitcoin's supply schedule.",
  },
  {
    q: 'Where does the data come from?',
    a: "US money-supply figures come from FRED, the Federal Reserve's public data service. Bitcoin's supply follows the protocol's fixed issuance schedule. The inflation section uses a static annual series of the Truflation US CPI index next to the official BLS CPI; the live bitcoin price comes from the Bits of Knowledge price service.",
  },
  {
    q: 'Is the projection a forecast?',
    a: "No. Everything past the last reported year is a scenario you control with the growth slider: the dollar supply is compounded at the rate you pick, which could be wrong in either direction. The Bitcoin side is not a scenario — it follows the protocol's issuance schedule and is the only genuinely fixed number in the chart.",
  },
  {
    q: 'Why do the halving details matter here?',
    a: "Because they are the mechanism behind the flattening supply curve. Every four years Bitcoin's issuance rate halves, so the page lists the dates, block rewards and annual issuance rates that produce it.",
  },
];

export function FaqSection() {
  return <BokFaq items={items} num="07" />;
}

export default FaqSection;
