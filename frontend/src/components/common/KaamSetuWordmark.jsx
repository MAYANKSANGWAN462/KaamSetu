// Combined 5a (Baloo 2 font, two-tone) + 5b (bridge arch below) logo.
// size: 'xs' for compact, 'sm' for header/footer, 'md' default, 'lg'/'xl' for hero.
const SIZES = {
  xs: [14, 5,  2],
  sm: [18, 7,  2],
  md: [24, 9,  3],
  lg: [36, 14, 4],
  xl: [48, 18, 6],
}

const KaamSetuWordmark = ({ size = 'md', className = '' }) => {
  const [fs, bh, mg] = SIZES[size] ?? SIZES.md

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column' }} className={`select-none ${className}`}>
      <span
        style={{
          fontFamily: "'Baloo 2', 'Arial Rounded MT Bold', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: fs,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        <span className="text-[#2B2119] dark:text-[#FBF6EF]">Kaam</span>
        <span style={{ color: '#E9731A' }}>Setu</span>
      </span>
      <svg
        viewBox="0 0 320 26"
        style={{ width: '100%', height: bh, marginTop: mg, display: 'block' }}
        aria-hidden="true"
      >
        <path
          d="M 6 20 C 90 -6 230 -6 314 20"
          fill="none"
          stroke="#E9731A"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export default KaamSetuWordmark
