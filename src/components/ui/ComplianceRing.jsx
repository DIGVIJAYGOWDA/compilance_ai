import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function ComplianceRing({ score = 0, size = 140, strokeWidth = 10, colorHex = '#16A34A', grade = 'A', message = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const countRef = useRef(null);
  const motionScore = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.4,
      ease: 'easeOut',
    });
    const unsubscribe = motionScore.on('change', (v) => {
      if (countRef.current) countRef.current.textContent = Math.round(v);
    });
    return () => { controls.stop(); unsubscribe(); };
  }, [score]);

  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colorHex}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={countRef} className="text-3xl font-black" style={{ color: colorHex, lineHeight: 1 }}>0</span>
        <span className="text-xs font-bold mt-0.5" style={{ color: colorHex }}>{grade}</span>
      </div>
    </div>
  );
}
