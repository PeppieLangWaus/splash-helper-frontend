import { colors } from '../../../theme';
import { gs } from '../style/guideTheme';

export type FaqEntry = { q: string; a: string };

/** Renders a list of FAQ entries as collapsible native `<details>`/`<summary>` items
 *  (no JS needed to expand, works with in-page find), plus the matching FAQPage
 *  JSON-LD `<script>` tag for SEO. */
export function Faq({ faqs }: { faqs: FaqEntry[] }) {
  return (
    <div className="guide-faq">
      {faqs.map((f) => (
        <details key={f.q} style={gs.faqItem}>
          <summary style={gs.faqSummary}>
            <svg
              className="guide-faq-chevron"
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M5 2l7 6-7 6" stroke={colors.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f.q}
          </summary>
          <p style={gs.faqAnswer}>{f.a}</p>
        </details>
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
