import React, { useState } from 'react';
import UrlForm from '../components/UrlForm';
import ReportCard from '../components/ReportCard';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import { requestAudit, AuditReport } from '../api/auditClient';
import { HelpCircle, ShieldAlert, Activity, History } from 'lucide-react';

export const copy = {
  hero: {
    headlinePrefix: "See ",
    headlineAccent: "exactly why",
    headlineSuffix: " your site scores the way it does.",
    subhead:
      "Page Pulse audits any page's SEO health and shows the full math behind every point. No hidden formula, no vague grade — just a clear readout of what's working and what isn't.",
  },

  howItWorks: {
    heading: "Enter a URL. Get a diagnosis, not just a number.",
    body: "Page Pulse checks your page the way a careful reviewer would — structure, content, and performance — then shows its work. Every deduction is labeled. Every point is accounted for.",
  },

  scoreBreakdown: {
    heading: "A score means nothing without the reasoning behind it.",
    body: 'Most audit tools hand you a grade and leave you guessing. Page Pulse\'s "Why this score?" panel shows the exact checks run and the exact points lost — so a 62 isn\'t a mystery, it\'s a list you can act on.',
  },

  security: {
    heading: "Secure by default. Tested, not assumed.",
    body: "Cookie-based auth, rate-limited endpoints, redacted logs — the parts of this system that don't show up on screen were built with the same care as the parts that do. The scoring math is unit-tested to guarantee the numbers always add up.",
  },

  history: {
    heading: "Your site's history, not just its snapshot.",
    body: "Every audit is saved. Watch scores shift as you make changes, and catch regressions before they become a pattern.",
  },
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);

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

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">
          {copy.hero.headlinePrefix}
          <span style={{ color: 'var(--accent-pulse)' }}>{copy.hero.headlineAccent}</span>
          {copy.hero.headlineSuffix}
        </h1>
        <p className="hero-subtitle">
          {copy.hero.subhead}
        </p>

        <UrlForm onSubmit={handleAuditSubmit} isLoading={loading} />
      </section>

      {error && <ErrorBanner code={error.code} message={error.message} />}

      {loading && <Loader />}

      {report && <ReportCard report={report} />}

      {!loading && !report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <HelpCircle size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              {copy.howItWorks.heading}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {copy.howItWorks.body}
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              {copy.scoreBreakdown.heading}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {copy.scoreBreakdown.body}
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              {copy.security.heading}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {copy.security.body}
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <History size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              {copy.history.heading}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {copy.history.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
