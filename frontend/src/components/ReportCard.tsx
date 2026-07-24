import React from 'react';
import { AuditReport } from '../api/auditClient';
import ScoreGauge from './ScoreGauge';
import { Clock, Heading1, Image, FileText, CheckCircle2, XCircle, Info } from 'lucide-react';

interface ReportCardProps {
  report: AuditReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Target Audit URL
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', wordBreak: 'break-all', marginTop: '0.2rem' }}>
            {report.url}
          </h2>
        </div>
        {report.savedToHistory && (
          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} /> Saved to History
          </span>
        )}
      </div>

      <div className="report-grid">
        <ScoreGauge score={report.score} grade={report.grade} />

        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Detailed Metrics & Diagnostic Checks
          </h3>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">
                <Clock size={16} style={{ color: '#06b6d4' }} /> Response Time
              </div>
              <div className="metric-value">{report.responseTimeMs} ms</div>
              <div className="metric-sub">
                HTTP Status: {report.status} ({report.status === 200 ? 'OK' : 'Error'})
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">
                <Heading1 size={16} style={{ color: '#6366f1' }} /> H1 Heading Count
              </div>
              <div className="metric-value" style={{ color: report.h1Count === 1 ? '#10b981' : '#f59e0b' }}>
                {report.h1Count}
              </div>
              <div className="metric-sub">
                {report.h1Count === 1 ? 'Optimal (Exactly 1 H1)' : report.h1Count === 0 ? 'Missing H1 tag' : 'Multiple H1 tags detected'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">
                <Image size={16} style={{ color: '#f43f5e' }} /> Missing Alt Text
              </div>
              <div className="metric-value" style={{ color: report.imagesMissingAlt === 0 ? '#10b981' : '#f43f5e' }}>
                {report.imagesMissingAlt}
              </div>
              <div className="metric-sub">
                {report.imagesMissingAlt === 0 ? 'All images have alt text' : `${report.imagesMissingAlt} images missing alt attribute`}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">
                <FileText size={16} style={{ color: '#f59e0b' }} /> Word Count
              </div>
              <div className="metric-value">{report.wordCount}</div>
              <div className="metric-sub">
                {report.wordCount >= 300 ? 'Sufficient content (≥300 words)' : 'Low word count (<300 words)'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} style={{ color: '#6366f1' }} /> Page Metadata Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#9ca3af', fontWeight: 600 }}>Title: </span>
                <span style={{ color: report.title ? '#fff' : '#f43f5e' }}>
                  {report.title || 'Missing title tag'}
                </span>
              </div>
              <div>
                <span style={{ color: '#9ca3af', fontWeight: 600 }}>Meta Description: </span>
                <span style={{ color: report.metaDescription ? '#d1d5db' : '#f43f5e' }}>
                  {report.metaDescription || 'Missing meta description tag'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
