import React from 'react'

export const PilotLogo = ({ size = 38, showText = true, textSize = '1.35rem' }) => {
  return (
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div 
        className="logo-icon-career"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          padding: size * 0.12,
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id="bar1Grad" x1="0" y1="100" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" opacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="bar2Grad" x1="0" y1="100" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="bar3Grad" x1="0" y1="100" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="arrowGrad" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Ascending Career Growth Bars */}
          <rect x="20" y="58" width="14" height="26" rx="4" fill="url(#bar1Grad)" />
          <rect x="42" y="42" width="14" height="42" rx="4" fill="url(#bar2Grad)" />
          <rect x="64" y="26" width="14" height="58" rx="4" fill="url(#bar3Grad)" />

          {/* Upward Career Growth Line & Arrow Head */}
          <path 
            d="M 18 72 L 40 48 L 56 56 L 78 22" 
            stroke="url(#arrowGrad)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 64 22 H 78 V 36" 
            stroke="url(#arrowGrad)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Milestone Star on Peak */}
          <circle cx="78" cy="22" r="4" fill="#ffffff" />
        </svg>
      </div>
      {showText && (
        <span className="logo-text" style={{ fontSize: textSize, fontWeight: 800, color: 'inherit', letterSpacing: '-0.02em' }}>
          Career<span className="highlight-purple">Pilot</span>
        </span>
      )}
    </div>
  )
}

export default PilotLogo
