import React from 'react';

/*
 * The brand mark: a profile drawn as one line in currentColor, mirrored across a
 * hairline; the reflection comes back in the four brand colours. Geometry is the
 * master in branding-kit/tools/build.py — change it there, then mirror here.
 */
const EDGE =
  'M 16.5 9 C 21 11.5, 23.6 17, 24 22 C 24.1 23.4, 23.4 24.4, 23.6 25.4 C 25.6 27.8, 28.6 30.4, 29.4 32.6 ' +
  'C 29.9 33.9, 29.1 34.8, 27.8 35 C 26.9 35.2, 26.1 35.3, 25.3 35.6 C 25.5 36.8, 26.4 37.5, 26.6 38.6 ' +
  'C 26.3 39.3, 25.9 39.6, 25.9 39.9 C 26.8 40.5, 27 41.7, 26.2 42.8 C 25.7 43.6, 26.2 44.6, 26.8 45.6 ' +
  'C 27.2 47.2, 25.9 48.9, 23.8 49.8 C 22.6 50.3, 21.8 50.6, 21.2 51 L 19.8 58';
const EYE = 'M 19 27.4 Q 20.8 28.9, 22.6 27.2';
const BACK = 'translate(-3.5 0)'; // each face sits 3.5 units off the glass: a reflection, not a kiss
const MIRROR = 'matrix(-1 0 0 1 64 0)';
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

interface MarkProps {
  size?: number;
  className?: string;
  /** Accessible name; omit when the mark sits next to visible text. */
  title?: string;
}

const Mark: React.FC<MarkProps> = ({ size = 30, className, title }) => {
  const id = 'mc-' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="58">
          <stop offset="0" style={{ stopColor: 'var(--color-dawn)' }} />
          <stop offset="0.333" style={{ stopColor: 'var(--color-lav)' }} />
          <stop offset="0.667" style={{ stopColor: 'var(--color-sky)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-mint)' }} />
        </linearGradient>
      </defs>
      <g transform="translate(32 32) scale(0.9) translate(-32 -32)">
        <g transform={BACK} stroke="currentColor">
          <path d={EDGE} strokeWidth={2.8} {...LINE} />
          <path d={EYE} strokeWidth={2.24} {...LINE} />
        </g>
        <path d="M 32 6 V 58" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" opacity={0.28} />
        <g transform={`${MIRROR} ${BACK}`} stroke={`url(#${id})`}>
          <path d={EDGE} strokeWidth={2.8} {...LINE} />
          <path d={EYE} strokeWidth={2.24} {...LINE} />
        </g>
      </g>
    </svg>
  );
};

export default Mark;
