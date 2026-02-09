'use client';

import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

export default function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generated: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 18 + 5,
      left: Math.random() * 95 + 2,
      delay: Math.random() * 14,
      duration: Math.random() * 8 + 10,
    }));
    setBubbles(generated);
  }, []);

  if (bubbles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {bubbles.map((bubble) => {
        const highlight = bubble.size * 0.3;
        return (
          <div
            key={bubble.id}
            style={{
              position: 'absolute',
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              bottom: '-60px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) ${highlight}%, transparent 55%),
                radial-gradient(circle at 70% 80%, rgba(255,255,255,0.12) 0%, transparent 35%),
                linear-gradient(135deg, 
                  rgba(255,0,0,0.06) 0%, 
                  rgba(255,165,0,0.06) 16%, 
                  rgba(255,255,0,0.06) 32%, 
                  rgba(0,200,0,0.06) 48%, 
                  rgba(0,150,255,0.06) 64%, 
                  rgba(75,0,130,0.06) 80%, 
                  rgba(200,0,255,0.06) 100%
                )
              `,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: `
                inset 0 -${bubble.size * 0.12}px ${bubble.size * 0.25}px rgba(150,100,255,0.08),
                inset 0 ${bubble.size * 0.08}px ${bubble.size * 0.18}px rgba(255,255,255,0.2),
                0 0 ${bubble.size * 0.15}px rgba(255,255,255,0.04)
              `,
              animation: `bubbleFloat ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
