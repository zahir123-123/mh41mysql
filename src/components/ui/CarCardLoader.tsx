import React from "react";

export const CarCardLoader = () => (
  <div className="flex flex-col items-center justify-end min-w-[180px] h-48 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-xl shadow relative overflow-hidden">
    {/* Animated Road */}
    <div className="absolute bottom-10 left-0 w-full h-5 overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-900 to-gray-700 rounded-t-lg" />
      <div
        className="absolute left-0 top-1/2 w-full h-1 -translate-y-1/2"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 20px, transparent 20px 40px)',
          backgroundSize: '60px 100%',
          animation: 'road-stripes 1s linear infinite',
          opacity: 0.7,
        }}
      />
    </div>
    {/* Futuristic Car SVG */}
    <svg
      width="72"
      height="40"
      viewBox="0 0 72 40"
      fill="none"
      className="z-10 mb-2"
      style={{
        animation: 'car-bounce 1.1s infinite cubic-bezier(.77,0,.18,1)'
      }}
    >
      {/* Under-glow */}
      <ellipse cx="36" cy="38" rx="21" ry="4" fill="#38bdf8" fillOpacity="0.33" />
      {/* Body */}
      <rect x="8" y="18" width="56" height="13" rx="7" fill="url(#bodyGradient)" />
      {/* Cockpit */}
      <rect x="20" y="7" width="32" height="12" rx="6" fill="url(#windowGradient)" />
      {/* Headlights */}
      <ellipse cx="12" cy="25" rx="2" ry="1" fill="#fde047" />
      <ellipse cx="60" cy="25" rx="2" ry="1" fill="#fde047" />
      {/* Wheels */}
      <ellipse cx="20" cy="31" rx="5" ry="5" fill="url(#wheelGradient)" />
      <ellipse cx="52" cy="31" rx="5" ry="5" fill="url(#wheelGradient)" />
      {/* License Plate */}
      <rect x="30" y="27" width="12" height="5" rx="2" fill="#f1f5f9" stroke="#0ea5e9" strokeWidth="0.6"/>
      <text x="36" y="31" textAnchor="middle" fontWeight="bold" fontSize="2.6" fill="#0ea5e9" fontFamily="monospace">
        MH41
      </text>
      <defs>
        <linearGradient id="bodyGradient" x1="8" y1="18" x2="64" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0369a1" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="windowGradient" x1="20" y1="7" x2="52" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <radialGradient id="wheelGradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="1"/>
          <stop offset="100%" stopColor="#0e7490" stopOpacity="1"/>
        </radialGradient>
      </defs>
    </svg>
    {/* "MH41 Cars" Text */}
    <div className="font-bold text-blue-700 text-base mb-2 tracking-wide drop-shadow-sm animate-fadein text-center">
      MH41 Cars
    </div>
    {/* Card shimmer effect */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="animate-[shimmer_2s_linear_infinite] absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent w-2/3 h-full"></div>
    </div>
    <style>
      {`
        @keyframes car-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes road-stripes {
          100% { background-position-x: 60px; }
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}
    </style>
  </div>
);