export default function OmniLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" stroke="url(#paint0_linear)" strokeWidth="2" />
      <circle cx="16" cy="16" r="10" fill="url(#paint1_radial)" opacity="0.8"/>
      <circle cx="16" cy="16" r="6" fill="#22d3ee" className="animate-pulse" style={{ animationDuration: '3s' }} />
      
      {/* Orbital paths */}
      <path d="M16 2C23.732 2 30 8.26801 30 16" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="2 4"/>
      <path d="M2 16C2 23.732 8.26801 30 16 30" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="2 4"/>
      
      {/* Crosshairs */}
      <path d="M16 6L16 10" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 22L16 26" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 16L10 16" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 16L26 16" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="paint0_linear" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(10)">
          <stop stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="1" stopColor="#0b1220" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
