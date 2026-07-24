import React, { useState } from 'react';
import UrlForm from '../components/UrlForm';
import ReportCard from '../components/ReportCard';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import { requestAudit, AuditReport } from '../api/auditClient';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, BarChart3 } from 'lucide-react';

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
        <h1 className="hero-title">Instant SEO & Web Health Scanner</h1>
        <p className="hero-subtitle">
          Enter any URL to fetch HTTP response time, title, meta descriptions, heading structures, image alt text compliance, and a composite 0–100 health score.
        </p>

        <UrlForm onSubmit={handleAuditSubmit} isLoading={loading} />
      </section>

      {error && <ErrorBanner code={error.code} message={error.message} />}

      {loading && <Loader />}

      {report && <ReportCard report={report} />}

      {!loading && !report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Real-time Parsing</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Executes high-speed server-side HTML scraping with Cheerio and calculates key SEO diagnostic indicators instantly.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>SSRF & Timeout Protection</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Hardened against internal host exploits, private network ranges, non-HTML payloads, and response timeouts.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>History & Analytics</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Create an account to automatically save your audit logs and visualize site health trends over time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
