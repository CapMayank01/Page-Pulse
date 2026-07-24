import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
}

export default function Loader({ label = 'Analyzing page health & SEO performance...' }: LoaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <Loader2 size={44} className="animate-spin" style={{ color: '#6366f1', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '1rem' }}>{label}</p>
    </div>
  );
}
