import React from 'react';
import { AuditReport } from '../api/auditClient';
import ScoreGauge from './ScoreGauge';
import { Clock, Heading1, Image, FileText, CheckCircle2, XCircle, AlertCircle, Info, Globe, ShieldCheck } from 'lucide-react';

interface ReportCardProps {
  report: AuditReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  // Helper to render pass/fail chip
  const renderStatusChip = (passed: boolean, label: string, details: string, isWarning = false) => {
    const Icon = passed ? CheckCircle2 : (isWarning ? AlertCircle : XCircle);
    const borderColor = passed 
      ? 'rgba(61, 220, 151, 0.2)' 
      : (isWarning ? 'rgba(245, 166, 35, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    const bgColor = passed 
      ? 'rgba(61, 220, 151, 0.04)' 
      : (isWarning ? 'rgba(245, 166, 35, 0.04)' : 'rgba(239, 68, 68, 0.04)');
    const textColor = passed 
      ? 'var(--grade-a)' 
      : (isWarning ? 'var(--grade-c)' : 'var(--grade-f)');

    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.15rem',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          background: bgColor,
          color: textColor,
        }}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{label}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{details}</span>
        </div>
      </div>
    );
  };

  const isTitlePassed = !!report.title && report.title.trim().length > 0;
  const isMetaPassed = !!report.metaDescription && report.metaDescription.trim().length > 0;
  const isWordCountPassed = report.wordCount >= 300;
  const isH1Passed = report.h1Count === 1;
  const isAltPassed = report.imagesMissingAlt === 0;
  const isResponseTimePassed = report.responseTimeMs < 500;
  const isStatusPassed = report.status === 200;

  return (
    <div className="glass-card" style={{ marginTop: '2rem', maxWidth: '720px', marginInline: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} style={{ color: 'var(--accent-pulse)' }} /> Audit Target URL
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', wordBreak: 'break-all', marginTop: '0.35rem', fontFamily: 'var(--font-display)' }}>
            {report.url}
          </h2>
        </div>
        {report.savedToHistory && (
          <span style={{ background: 'rgba(61, 220, 151, 0.08)', color: 'var(--accent-pulse)', border: '1px solid rgba(61, 220, 151, 0.25)', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.02em', height: 'fit-content' }}>
            <ShieldCheck size={14} /> Saved
          </span>
        )}
      </div>

      <div className="report-grid">
        <ScoreGauge score={report.score} grade={report.grade} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Content */}
          <div className="report-section">
            <h4 className="report-section-title">Content & Vitals</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderStatusChip(
                isTitlePassed, 
                isTitlePassed ? 'Title Present' : 'Title Missing', 
                report.title ? `"${report.title.substring(0, 45)}${report.title.length > 45 ? '...' : ''}"` : 'Page title tag is empty or absent.'
              )}
              {renderStatusChip(
                isMetaPassed, 
                isMetaPassed ? 'Meta Description Present' : 'Meta Description Missing', 
                report.metaDescription ? `"${report.metaDescription.substring(0, 45)}${report.metaDescription.length > 45 ? '...' : ''}"` : 'Search engines will auto-generate descriptions.',
                !isMetaPassed // Warn if missing meta
              )}
              {renderStatusChip(
                isWordCountPassed, 
                `${report.wordCount} Words`, 
                isWordCountPassed ? 'Optimal body content length.' : 'Low content volume (< 300 words).',
                !isWordCountPassed // Warn if low words
              )}
            </div>
          </div>

          {/* Section 2: Structure */}
          <div className="report-section">
            <h4 className="report-section-title">Semantic Structure</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderStatusChip(
                isH1Passed, 
                `${report.h1Count} H1 Headings`, 
                isH1Passed ? 'Perfect semantic hierarchy.' : report.h1Count === 0 ? 'Missing critical H1 tag.' : 'Multiple H1 tags dilute SEO keywords.'
              )}
              {renderStatusChip(
                isAltPassed, 
                isAltPassed ? 'All Images Accessible' : `${report.imagesMissingAlt} Missing Alt Texts`, 
                isAltPassed ? 'All images have alternative descriptions.' : `${report.imagesMissingAlt} image tags are missing alt attributes.`,
                !isAltPassed // Warn/Error if alt missing
              )}
            </div>
          </div>

          {/* Section 3: Performance */}
          <div className="report-section">
            <h4 className="report-section-title">Performance & Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderStatusChip(
                isResponseTimePassed, 
                `Response Time: ${report.responseTimeMs}ms`, 
                isResponseTimePassed ? 'Fast server response time.' : 'Slow response (>500ms), optimize backend payload.',
                !isResponseTimePassed
              )}
              {renderStatusChip(
                isStatusPassed, 
                `HTTP Status ${report.status}`, 
                isStatusPassed ? 'Connection successful.' : `Returned non-OK status: ${report.status}`
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
