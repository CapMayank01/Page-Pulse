import React from 'react';

interface LoaderProps {
  label?: string;
}

export default function Loader({ label = 'Analyzing page health & SEO performance...' }: LoaderProps) {
  return (
    <div style={{ maxWidth: '720px', marginInline: 'auto', marginTop: '2rem' }}>
      {/* Skeleton Preview of the ReportCard */}
      <div className="glass-card" style={{ pointerEvents: 'none', opacity: 0.6 }}>
        {/* Header Shimmer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '60%' }}>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '20px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
        </div>

        <div className="report-grid">
          {/* Gauge Shimmer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <div className="skeleton-shimmer" style={{ width: '130px', height: '130px', borderRadius: '50%' }} />
            <div className="skeleton-shimmer" style={{ width: '90px', height: '24px', borderRadius: '4px' }} />
          </div>

          {/* Section Shimmers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Section 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '4px', marginBottom: '0.25rem' }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
            </div>
            {/* Section 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '4px', marginBottom: '0.25rem' }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ color: 'var(--accent-pulse)', fontWeight: 600, fontSize: '1rem', animation: 'pulse-slow 2s infinite ease-in-out' }}>
          {label}
        </p>
        <style>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
