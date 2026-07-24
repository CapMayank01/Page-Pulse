import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AuditReport } from '../api/auditClient';

interface TrendChartProps {
  audits: AuditReport[];
}

export default function TrendChart({ audits }: TrendChartProps) {
  if (audits.length === 0) return null;

  // Format data in chronological order for trend charts
  const chartData = [...audits].reverse().map((item, idx) => ({
    name: `#${idx + 1}`,
    url: item.url,
    score: item.score,
    responseTimeMs: item.responseTimeMs,
  }));

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' }}>
        Audit Performance & Health Score Trends
      </h3>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis yAxisId="left" domain={[0, 90]} stroke="#6366f1" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} name="Health Score (0-90)" dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="responseTimeMs" stroke="#06b6d4" strokeWidth={2} name="Response Time (ms)" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
