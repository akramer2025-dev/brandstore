'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  opacity: number;
  type: 'circle' | 'star' | 'crescent';
}

interface Rocket {
  id: number;
  x: number;
  delay: number;
  color: string;
}

const COLORS = [
  '#FFD700', '#FF6B6B', '#A855F7', '#EC4899', '#F97316',
  '#22D3EE', '#4ADE80', '#FBBF24', '#FB923C', '#E879F9',
];

export default function FireworksEffect() {
  const [show, setShow] = useState(false);
  const [rockets, setRockets] = useState<Rocket[]>([]);

  useEffect(() => {
    // تظهر بعد 4 ثواني (بعد ما الـ splash يختفي)
    const alreadyShown = sessionStorage.getItem('fireworksShown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem('fireworksShown', 'true');

      // إنشاء صواريخ متتابعة
      const rocketList: Rocket[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        delay: i * 0.4 + Math.random() * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      setRockets(rocketList);

      // إخفاء بعد 4 ثواني
      setTimeout(() => setShow(false), 4500);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99998] pointer-events-none overflow-hidden" aria-hidden="true">
      {rockets.map((rocket) => (
        <div key={rocket.id} className="absolute bottom-0" style={{ left: `${rocket.x}%` }}>
          {/* الصاروخ الطالع */}
          <div
            className="absolute w-1 rounded-full"
            style={{
              height: '20px',
              background: `linear-gradient(to top, transparent, ${rocket.color})`,
              animation: `rocketUp 0.8s ease-out ${rocket.delay}s forwards`,
              opacity: 0,
            }}
          />
          {/* الانفجار */}
          <div
            className="absolute"
            style={{
              animation: `rocketExplode 0.8s ease-out ${rocket.delay}s forwards`,
              opacity: 0,
            }}
          >
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i / 16) * 360;
              const dist = 40 + Math.random() * 60;
              const particleColor = COLORS[Math.floor(Math.random() * COLORS.length)];
              const size = Math.random() * 4 + 2;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: particleColor,
                    boxShadow: `0 0 ${size * 2}px ${particleColor}`,
                    top: '50%',
                    left: '50%',
                    animation: `particleBurst 1.2s ease-out ${rocket.delay + 0.7}s forwards`,
                    opacity: 0,
                    '--px': `${Math.cos((angle * Math.PI) / 180) * dist}px`,
                    '--py': `${Math.sin((angle * Math.PI) / 180) * dist}px`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* ✨ شرارات عشوائية */}
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-yellow-300"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60 + 10}%`,
            fontSize: `${Math.random() * 14 + 8}px`,
            animation: `sparkleIn 0.6s ease-out ${1 + Math.random() * 2.5}s forwards`,
            opacity: 0,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
}
