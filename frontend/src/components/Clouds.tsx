import React from 'react';

interface CloudsProps {
  variant?: 'page' | 'dusk';
}

interface CloudSpec {
  width: number;
  height: number;
  top: string;
  duration: number; // seconds for one crossing
  delay: number;    // negative = start mid-crossing so the sky is never empty
  opacity: number;
}

const PAGE_CLOUDS: CloudSpec[] = [
  { width: 460, height: 150, top: '4%',  duration: 150, delay: -30,  opacity: 0.75 },
  { width: 320, height: 110, top: '14%', duration: 115, delay: -85,  opacity: 0.55 },
  { width: 560, height: 170, top: '38%', duration: 185, delay: -120, opacity: 0.4 },
  { width: 280, height: 100, top: '62%', duration: 135, delay: -50,  opacity: 0.35 },
  { width: 400, height: 130, top: '80%', duration: 165, delay: -140, opacity: 0.45 },
];

const DUSK_CLOUDS: CloudSpec[] = [
  { width: 480, height: 160, top: '8%',  duration: 95,  delay: -25, opacity: 0.5 },
  { width: 340, height: 120, top: '30%', duration: 75,  delay: -55, opacity: 0.4 },
  { width: 520, height: 170, top: '55%', duration: 105, delay: -80, opacity: 0.45 },
  { width: 300, height: 110, top: '78%', duration: 85,  delay: -40, opacity: 0.35 },
];

/**
 * Ambient drifting clouds.
 * 'page' — soft morning sky behind the whole app.
 * 'dusk' — deeper twilight wash, used behind modals (parent supplies position/stacking).
 */
const Clouds: React.FC<CloudsProps> = ({ variant = 'page' }) => {
  const clouds = variant === 'page' ? PAGE_CLOUDS : DUSK_CLOUDS;

  return (
    <div
      aria-hidden="true"
      className={
        variant === 'page'
          ? 'fixed inset-0 -z-10 overflow-hidden'
          : 'absolute inset-0 overflow-hidden'
      }
    >
      {variant === 'page' && (
        <>
          {/* morning sky fading into paper */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, #dfe8f4 0%, #eef0ef 34%, var(--color-paper) 62%)',
            }}
          />
          {/* low warm glow, top right — dawn light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(52% 38% at 82% 0%, rgb(246 214 189 / 0.55), transparent)',
            }}
          />
        </>
      )}

      {clouds.map((cloud, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            width: cloud.width,
            height: cloud.height,
            top: cloud.top,
            left: 0,
            opacity: cloud.opacity,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
            ...(variant === 'dusk'
              ? { ['--cloud-color' as string]: 'rgb(255 255 255 / 0.55)' }
              : {}),
          }}
        />
      ))}
    </div>
  );
};

export default Clouds;
