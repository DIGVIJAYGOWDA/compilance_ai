import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiAnimation({ trigger }) {
  const fired = useRef(false);

  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true;
      const end = Date.now() + 3000;
      const colors = ['#1A56DB', '#16A34A', '#F59E0B', '#7C3AED'];
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [trigger]);

  return null;
}
