export function MathBackground() {
  // Pre-calculate paths synchronously so they are NEVER undefined
  const generateSine = (amp, freq, phase, yOffset) => {
    let d = `M 0 ${yOffset}`;
    for (let x = 0; x <= 1200; x += 8) {
      const y = yOffset + amp * Math.sin((x / 1200) * Math.PI * 2 * freq + phase);
      d += ` L ${x} ${y}`;
    }
    return d;
  };

  const generateLissajous = (a, b, delta, steps = 150) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = 600 + 400 * Math.sin(a * t + delta);
      const y = 400 + 300 * Math.sin(b * t);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  const sine1 = generateSine(40, 2, 0, 400);
  const sine2 = generateSine(25, 3, Math.PI / 2, 600);
  const lissajous1 = generateLissajous(3, 2, 0);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#bgGlow)" />

        {/* Pure CSS animated paths to completely avoid Framer Motion SVG interpolation bugs */}
        <path 
          d={sine1} 
          fill="none" 
          stroke="url(#waveGrad)" 
          strokeWidth="1.2"
          style={{ 
            strokeDasharray: 3000, 
            strokeDashoffset: 3000, 
            animation: 'dash 15s linear infinite' 
          }} 
        />
        <path 
          d={sine2} 
          fill="none" 
          stroke="url(#waveGrad)" 
          strokeWidth="0.8"
          style={{ 
            strokeDasharray: 3000, 
            strokeDashoffset: 3000, 
            animation: 'dash 20s linear infinite reverse' 
          }} 
        />
        <polygon 
          points={lissajous1} 
          fill="none" 
          stroke="url(#waveGrad)" 
          strokeWidth="0.5"
          style={{ 
            animation: 'pulseOpacity 8s ease-in-out infinite' 
          }} 
        />
      </svg>
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}