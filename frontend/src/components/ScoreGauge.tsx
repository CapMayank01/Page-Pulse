import React from 'react';

interface ScoreGaugeProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: number;
}

export default function ScoreGauge({ score, grade, size = 160 }: ScoreGaugeProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / 90) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#10b981'; // Green A
  if (score < 90 && score >= 75) color = '#06b6d4'; // Cyan B
  else if (score < 75 && score >= 60) color = '#f59e0b'; // Amber C
  else if (score < 60 && score >= 40) color = '#f97316'; // Orange D
  else if (score < 40) color = '#f43f5e'; // Red F

  return (
    <div className="score-gauge-box">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} className="gauge-svg">
          <circle
            className="gauge-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            className="gauge-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginTop: '0.2rem' }}>
            / 90
          </span>
        </div>
      </div>

      <div className={`grade-badge grade-${grade}`}>
        Grade {grade}
      </div>
    </div>
  );
}
