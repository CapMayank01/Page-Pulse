import React, { useState } from 'react';
import { AuditReport } from '../api/auditClient';
import ScoreGauge from './ScoreGauge';
import { Clock, Heading1, Image, FileText, CheckCircle2, XCircle, AlertCircle, Info, Globe, ShieldCheck } from 'lucide-react';

interface ReportCardProps {
  report: AuditReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false);
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
  const isAltPassed = report.missingAltImages === 0;
  const isResponseTimePassed = report.responseTime < 500;
  const isStatusPassed = report.status === 200;

  if (report.mode === 'video') {
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span style={{ background: 'rgba(61, 220, 151, 0.1)', color: 'var(--accent-pulse)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {report.platform || 'Streaming Content'}
              </span>
              <ScoreGauge score={report.score} grade={report.grade} />
            </div>
            {report.breakdown && report.breakdown.length > 0 && (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    border: '1px dashed var(--border-color)',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--accent-pulse)'
                  }}
                  aria-expanded={expanded}
                >
                  {expanded ? 'Hide scoring math' : 'Why this score?'}
                </button>
                {expanded && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {report.breakdown.map((item, idx) => {
                        const itemColor = item.status === 'Passed' 
                          ? 'var(--grade-a)' 
                          : (item.status === 'Warning' ? 'var(--grade-c)' : 'var(--grade-f)');
                        const prefixIcon = item.status === 'Passed' ? '✓' : (item.status === 'Warning' ? '⚠' : '✕');
                        return (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-display)',
                              borderBottom: idx < report.breakdown!.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                              paddingBottom: '0.5rem',
                              paddingTop: '0.25rem',
                              color: 'var(--text-primary)',
                              gap: '0.2rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textAlign: 'left', fontWeight: 600 }}>
                                <span style={{ color: itemColor, fontWeight: 800 }}>{prefixIcon}</span>
                                {item.check}
                              </span>
                              <span style={{ color: item.points < 0 ? 'var(--grade-f)' : (item.points === 0 ? 'var(--text-muted)' : 'var(--grade-a)'), fontWeight: 700, paddingLeft: '0.5rem' }}>
                                {item.points > 0 ? `+${item.points}` : (item.points === 0 ? '—' : item.points)}
                              </span>
                            </div>
                            {item.suggestion && (
                              <div style={{ fontSize: '0.7rem', color: '#A3B3C2', paddingLeft: '1.15rem', textAlign: 'left', lineHeight: 1.4 }}>
                                {item.suggestion}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="report-section">
              <h4 className="report-section-title">Streaming diagnostics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {renderStatusChip(
                  report.url.toLowerCase().startsWith('https://'),
                  report.url.toLowerCase().startsWith('https://') ? 'Secure HTTPS' : 'Insecure HTTP',
                  report.url.toLowerCase().startsWith('https://') ? 'Safe transport enabled.' : 'Target URL does not use SSL.'
                )}
                {renderStatusChip(
                  report.status >= 200 && report.status < 300,
                  `HTTP Status ${report.status}`,
                  report.status >= 200 && report.status < 300 ? 'Video page accessible.' : `Server returned status code: ${report.status}`
                )}
                {renderStatusChip(
                  report.breakdown?.some(i => i.check === 'Video Metadata' && i.status === 'Passed') || false,
                  report.breakdown?.some(i => i.check === 'Video Metadata' && i.status === 'Passed') ? 'Metadata Found' : 'Missing Video Metadata',
                  report.breakdown?.some(i => i.check === 'Video Metadata' && i.status === 'Passed') ? 'og:video or twitter:player present.' : 'Missing embed crawler metadata.'
                )}
                {renderStatusChip(
                  report.responseTime < 500,
                  `Response Time: ${report.responseTime}ms`,
                  report.responseTime < 500 ? 'Optimal platform loading speeds.' : 'Suboptimal latency measured.'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', alignSelf: 'start' }}>
          <ScoreGauge score={report.score} grade={report.grade} />
          {report.breakdown && report.breakdown.length > 0 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.75rem',
                  border: '1px dashed var(--border-color)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--accent-pulse)'
                }}
                aria-expanded={expanded}
              >
                {expanded ? 'Hide scoring math' : 'Why this score?'}
              </button>
              {expanded && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {report.breakdown.map((item, idx) => {
                      const itemColor = item.status === 'Passed' 
                        ? 'var(--grade-a)' 
                        : (item.status === 'Warning' ? 'var(--grade-c)' : 'var(--grade-f)');
                      const prefixIcon = item.status === 'Passed' ? '✓' : (item.status === 'Warning' ? '⚠' : '✕');
                      return (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-display)',
                            borderBottom: idx < report.breakdown!.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            paddingBottom: '0.5rem',
                            paddingTop: '0.25rem',
                            color: 'var(--text-primary)',
                            gap: '0.2rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textAlign: 'left', fontWeight: 600 }}>
                              <span style={{ color: itemColor, fontWeight: 800 }}>{prefixIcon}</span>
                              {item.check}
                            </span>
                            <span style={{ color: item.points < 0 ? 'var(--grade-f)' : (item.points === 0 ? 'var(--text-muted)' : 'var(--grade-a)'), fontWeight: 700, paddingLeft: '0.5rem' }}>
                              {item.points > 0 ? `+${item.points}` : (item.points === 0 ? '—' : item.points)}
                            </span>
                          </div>
                          {item.suggestion && (
                            <div style={{ fontSize: '0.7rem', color: '#A3B3C2', paddingLeft: '1.15rem', textAlign: 'left', lineHeight: 1.4 }}>
                              {item.suggestion}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

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
                isAltPassed ? 'All Images Accessible' : `${report.missingAltImages} Missing Alt Texts`, 
                isAltPassed ? 'All images have alternative descriptions.' : `${report.missingAltImages} image tags are missing alt attributes.`,
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
                `Response Time: ${report.responseTime}ms`, 
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
