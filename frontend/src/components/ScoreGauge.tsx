import React, { useState, useEffect } from 'react';

interface ScoreGaugeProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: number;
}

export default function ScoreGauge({ score, grade, size = 160 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAnimatedScore(score);
      return;
    }

    const duration = 900; // 900ms sweep
    const startTime = performance.now();
    const startVal = 0;
    const endVal = score;

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // cubic-bezier ease-out
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startVal + (endVal - startVal) * easeOutCubic));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage out of 90 max score
  const percentage = Math.min(100, Math.max(0, (animatedScore / 90) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Grade color variables
  let gradeColorVar = 'var(--grade-a)';
  if (grade === 'B') gradeColorVar = 'var(--grade-b)';
  else if (grade === 'C') gradeColorVar = 'var(--grade-c)';
  else if (grade === 'D') gradeColorVar = 'var(--grade-d)';
  else if (grade === 'F') gradeColorVar = 'var(--grade-f)';

  // ECG path configuration keyed to grade
  let ecgPath = 'M 0 15 H 100';
  let ecgSpeed = '4s';

  if (grade === 'A' || grade === 'B') {
    ecgPath = 'M 0 15 L 30 15 Q 40 5, 45 15 T 55 15 L 100 15'; // Steady calm QRS/sine-like
    ecgSpeed = '3.5s';
  } else if (grade === 'C') {
    ecgPath = 'M 0 15 L 20 15 L 25 5 L 30 25 L 35 15 L 60 15 L 65 5 L 70 25 L 75 15 L 100 15'; // Moderate QRS
    ecgSpeed = '2.5s';
  } else {
    // D/F: rapid, erratic sharp spikes
    ecgPath = 'M 0 15 L 10 15 L 13 3 L 17 27 L 20 15 L 35 15 L 38 2 L 42 28 L 45 15 L 60 15 L 63 3 L 67 27 L 70 15 L 100 15';
    ecgSpeed = '1.2s';
  }

  return (
    <div className="score-gauge-box">
      {/* Decorative ECG Sweep behind the gauge */}
      <div style={{ position: 'absolute', top: '15px', width: '100%', height: '30px', opacity: 0.25, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d={ecgPath}
            fill="none"
            stroke={gradeColorVar}
            strokeWidth="1.5"
            className="ecg-line"
            style={{ animationDuration: ecgSpeed }}
          />
        </svg>
      </div>

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
            stroke={gradeColorVar}
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
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
            {animatedScore}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', fontFamily: 'var(--font-display)' }}>
            / 90
          </span>
        </div>
      </div>

      <div className={`grade-badge grade-${grade}`} style={{ color: gradeColorVar }}>
        Grade {grade}
      </div>
    </div>
  );
}
