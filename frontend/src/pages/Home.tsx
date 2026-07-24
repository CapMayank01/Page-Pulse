import React, { useState, useRef } from 'react';
import UrlForm from '../components/UrlForm';
import ReportCard from '../components/ReportCard';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import { requestAudit, AuditReport } from '../api/auditClient';
import { HelpCircle, ShieldAlert, Activity, History, ArrowRight } from 'lucide-react';

export const copy = {
  hero: {
    headlinePrefix: "See ",
    headlineAccent: "exactly why",
    headlineSuffix: " your site scores the way it does.",
    subhead:
      "Page Pulse audits any page's SEO health and shows the full math behind every point. No hidden formula, no vague grade — just a clear readout of what's working and what isn't.",
  },

  qualifyingStrip: {
    line: "Built for developers who ship real projects — and for anyone reviewing the work behind them.",
  },

  whatItDoes: {
    kicker: "What it does",
    heading: "Enter a URL. Get a diagnosis, not just a number.",
    body: "Page Pulse checks your page the way a careful reviewer would — structure, content, and performance — then shows its work. Every deduction is labeled. Every point is accounted for.",
  },

  whyDifferent: {
    kicker: "Why it's different",
    heading: "A score means nothing without the reasoning behind it.",
    body: 'Most audit tools hand you a grade and leave you guessing. Page Pulse\'s "Why this score?" panel shows the exact checks run and the exact points lost — so a 62 isn\'t a mystery, it\'s a list you can act on. Every deduction is unit-tested, so the math you see is math you can verify.',
  },

  gettingStarted: {
    kicker: "How you get started",
    heading: "Paste a URL. That's the whole first step.",
    body: "No account required to run a check. Enter a link, get a full report in seconds, and create an account only when you want to save it and track it over time.",
    steps: [
      "Paste any URL into the field above.",
      "Get a scored report with the full breakdown, instantly.",
      "Save it to your history to track changes over time.",
    ],
  },

  dayToDay: {
    kicker: "What it feels like",
    heading: "Day to day, this is what changes.",
    lines: [
      "Every check has a reason, and the reason is always on screen.",
      "Your history stays close, so a trend is a glance, not a search.",
      "Nothing here is animated to impress you — only to help you notice.",
    ],
    visualAlt: "Page Pulse report card showing a score gauge and breakdown panel",
  },

  footerCta: {
    heading: "Run your first audit. See the reasoning, not just the result.",
    buttonLabel: "Check a page →",
  },
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAuditSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await requestAudit(url);
      setReport(result);
    } catch (err: any) {
      setError({
        code: err.code || 'ERROR',
        message: err.message || 'An error occurred while analyzing the target site.',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div ref={formRef}>
        <section className="hero-section" style={{ paddingBottom: '1.5rem' }}>
          <h1 className="hero-title">
            {copy.hero.headlinePrefix}
            <span style={{ color: 'var(--accent-pulse)' }}>{copy.hero.headlineAccent}</span>
            {copy.hero.headlineSuffix}
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: '2rem' }}>
            {copy.hero.subhead}
          </p>

          <UrlForm onSubmit={handleAuditSubmit} isLoading={loading} />
        </section>
      </div>

      {!loading && !report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {/* Qualifying Strip */}
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '0.85rem 1rem', 
              borderBlock: '1px solid var(--border-color)', 
              color: 'var(--text-muted)', 
              fontSize: '0.9rem', 
              fontWeight: 500,
              maxWidth: '850px',
              marginInline: 'auto',
              width: '100%'
            }}
          >
            {copy.qualifyingStrip.line}
          </div>

          {/* Section: What it does & Why different */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1000px', marginInline: 'auto', width: '100%' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ textTransform: 'uppercase', color: 'var(--accent-pulse)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                {copy.whatItDoes.kicker}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                {copy.whatItDoes.heading}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {copy.whatItDoes.body}
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ textTransform: 'uppercase', color: 'var(--accent-pulse)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                {copy.whyDifferent.kicker}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                {copy.whyDifferent.heading}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {copy.whyDifferent.body}
              </p>
            </div>
          </div>

          {/* Section: Getting Started */}
          <div className="glass-card" style={{ maxWidth: '850px', marginInline: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ textTransform: 'uppercase', color: 'var(--accent-pulse)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>
              {copy.gettingStarted.kicker}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              {copy.gettingStarted.heading}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {copy.gettingStarted.body}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
              {copy.gettingStarted.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.4 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Day to Day Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '950px', marginInline: 'auto', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ textTransform: 'uppercase', color: 'var(--accent-pulse)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                {copy.dayToDay.kicker}
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>
                {copy.dayToDay.heading}
              </h3>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {copy.dayToDay.lines.map((line, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--accent-pulse)', fontWeight: 800 }}>→</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decorative Osciloscope / Graphic Card */}
            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem', position: 'relative', overflow: 'hidden' }} aria-label={copy.dayToDay.visualAlt}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', fontFamily: 'var(--font-display)', color: 'rgba(61,220,151,0.3)' }}>
                SYS.DIAG_v1.0
              </div>
              <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--accent-pulse)" strokeWidth="3" strokeDasharray="100" strokeDashoffset="30" />
              </svg>
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>70 / 90</div>
                <div style={{ color: 'var(--grade-b)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.2rem' }}>Grade B</div>
              </div>
              <div style={{ width: '100%', height: '30px', opacity: 0.3 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 0 15 L 20 15 L 25 5 L 30 25 L 35 15 L 60 15 L 65 5 L 70 25 L 75 15 L 100 15" fill="none" stroke="var(--accent-pulse)" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Footer CTA */}
          <div style={{ textAlign: 'center', paddingBlock: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', maxWidth: '600px', lineHeight: 1.3 }}>
              {copy.footerCta.heading}
            </h3>
            <button 
              className="btn-primary" 
              onClick={scrollToForm}
              style={{ padding: '0.85rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {copy.footerCta.buttonLabel}
            </button>
          </div>

        </div>
      )}

      {error && <ErrorBanner code={error.code} message={error.message} />}

      {loading && <Loader />}

      {report && <ReportCard report={report} />}
    </div>
  );
}
