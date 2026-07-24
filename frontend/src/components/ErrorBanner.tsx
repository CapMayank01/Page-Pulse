import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  code?: string;
  message: string;
}

export default function ErrorBanner({ code, message }: ErrorBannerProps) {
  return (
    <div className="error-banner">
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {code && <span className="error-banner-code">{code}</span>}
        <p style={{ marginTop: code ? '0.35rem' : 0, fontWeight: 500, fontSize: '0.95rem' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
