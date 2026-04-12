// Purpose: Renders a premium custom cursor with smooth-from-first-move ring follow and hover interactions.
// Fix: Ring initializes off-screen to prevent corner-snap on first mouse entry.
// Visual: Ember/molten amber aesthetic — sharp dot + spinning orbital arc ring.
import { useEffect, useRef, useState } from 'react'

// Inject keyframes once into the document head
const STYLE_ID = 'custom-cursor-styles'
const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .custom-cursor-enabled,
    .custom-cursor-enabled * {
      cursor: none !important;
    }

    @keyframes cursor-spin {
      from { transform: translate3d(calc(var(--rx) - 50%), calc(var(--ry) - 50%), 0) rotate(0deg); }
      to   { transform: translate3d(calc(var(--rx) - 50%), calc(var(--ry) - 50%), 0) rotate(360deg); }
    }

    @keyframes cursor-pulse {
      0%, 100% { opacity: 0.55; }
      50%       { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

const CustomCursor = () => {
  const [dot, setDot]       = useState({ x: -9999, y: -9999 })
  const [ring, setRing]     = useState({ x: -9999, y: -9999 })
  const [hovered, setHovered] = useState(false)
  const [hidden, setHidden]   = useState(true)   // starts hidden until first mouse move
  const [clicking, setClicking] = useState(false)

  // Keep mutable ref for ring so rAF closure always has latest value
  const ringRef  = useRef({ x: -9999, y: -9999 })
  const targetRef = useRef({ x: -9999, y: -9999 })
  const rafRef    = useRef(null)
  const enteredRef = useRef(false)

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return undefined

    injectStyles()
    document.body.classList.add('custom-cursor-enabled')

    // Slightly higher lerp (0.2) = snappier response, still smooth
    const LERP = 0.2

    const animateRing = () => {
      const prev = ringRef.current
      const tgt  = targetRef.current
      const next = {
        x: prev.x + (tgt.x - prev.x) * LERP,
        y: prev.y + (tgt.y - prev.y) * LERP,
      }
      ringRef.current = next
      setRing({ ...next })
      rafRef.current = requestAnimationFrame(animateRing)
    }
    rafRef.current = requestAnimationFrame(animateRing)

    const handleMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY }
      targetRef.current = pos
      setDot(pos)

      // On first move, snap ring to cursor so there's zero travel lag
      if (!enteredRef.current) {
        ringRef.current = pos
        enteredRef.current = true
      }
      setHidden(false)
    }

    const handleOver = (e) => {
      setHovered(Boolean(
        e.target.closest('button, a, [role="button"], input, textarea, select, label')
      ))
    }
    const handleOut   = () => setHovered(false)
    const handleLeave = () => setHidden(true)
    const handleEnter = () => setHidden(false)
    const handleDown  = () => setClicking(true)
    const handleUp    = () => setClicking(false)

    document.addEventListener('mousemove',  handleMove)
    document.addEventListener('mouseover',  handleOver)
    document.addEventListener('mouseout',   handleOut)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mousedown',  handleDown)
    document.addEventListener('mouseup',    handleUp)

    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove',  handleMove)
      document.removeEventListener('mouseover',  handleOver)
      document.removeEventListener('mouseout',   handleOut)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mousedown',  handleDown)
      document.removeEventListener('mouseup',    handleUp)
    }
  }, [])

  // ── Derived style values ──────────────────────────────────────────────────

  const dotSize   = clicking ? 4 : hovered ? 7 : 5
  const ringSize  = hovered ? 42 : 28
  // Clicking compresses the ring inward
  const ringScale = clicking ? 0.8 : 1

  const dotStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width:  dotSize,
    height: dotSize,
    borderRadius: '50%',
    // Amber ember core — slightly warmer gradient on hover
    background: hovered
      ? 'radial-gradient(circle, #fde68a 0%, #f97316 60%, #ea580c 100%)'
      : 'radial-gradient(circle, #fef3c7 0%, #f59e0b 70%)',
    boxShadow: hovered
      ? '0 0 10px 3px rgba(251,146,60,0.7), 0 0 4px 1px rgba(255,255,255,0.4)'
      : '0 0 6px 2px rgba(245,158,11,0.6)',
    transform: `translate3d(calc(${dot.x}px - 50%), calc(${dot.y}px - 50%), 0)`,
    pointerEvents: 'none',
    zIndex: 99999,
    transition: [
      'width 0.15s cubic-bezier(0.34,1.56,0.64,1)',
      'height 0.15s cubic-bezier(0.34,1.56,0.64,1)',
      'box-shadow 0.2s ease',
      'background 0.2s ease',
    ].join(', '),
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  }

  // The ring uses an SVG-based conic border trick via a box-shadow + clip approach.
  // Simplest performant method: a rotated border with a transparent gap via
  // border-style dashed — elegant and zero extra DOM.
  const ringStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width:  ringSize,
    height: ringSize,
    borderRadius: '50%',
    // Dashed border creates an arc-gap effect; rotation via CSS animation gives orbital feel
    border: hovered
      ? '1.5px dashed rgba(251,146,60,0.85)'
      : '1px dashed rgba(245,158,11,0.45)',
    background: hovered
      ? 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)'
      : 'transparent',
    // Spin animation — slow enough to not distract, fast enough to feel alive
    animation: `cursor-spin ${hovered ? '2s' : '4s'} linear infinite`,
    // CSS vars trick won't work in animation keyframes for translate, so we use
    // a wrapper transform approach: position via translate, then apply scale
    transform: `translate3d(calc(${ring.x}px - 50%), calc(${ring.y}px - 50%), 0) scale(${ringScale})`,
    // Override the animation's transform — animation handles rotation, inline handles position
    // We achieve both by splitting into two DOM nodes below
    pointerEvents: 'none',
    zIndex: 99998,
    transition: [
      'width 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      'height 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      'border-color 0.2s ease',
      'background 0.2s ease',
      'animation-duration 0.4s ease',
    ].join(', '),
    opacity: hidden ? 0 : 0.9,
    willChange: 'transform',
  }

  // Outer glow halo — purely ambient, very subtle
  const haloStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width:  hovered ? 68 : 52,
    height: hovered ? 68 : 52,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(251,146,60,${hovered ? 0.10 : 0.05}) 0%, transparent 70%)`,
    transform: `translate3d(calc(${ring.x}px - 50%), calc(${ring.y}px - 50%), 0)`,
    pointerEvents: 'none',
    zIndex: 99997,
    transition: 'width 0.35s ease, height 0.35s ease, background 0.3s ease',
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  // The ring position + spin requires two nested divs:
  //   outer → handles translate (position tracking)
  //   inner → handles rotate (spin animation) + size
  // This avoids the transform collision problem where a single element
  // can't independently animate rotation AND be translated via inline style.

  return (
    <>
      {/* Ambient halo — soft glow that trails the ring */}
      <div style={haloStyle} aria-hidden="true" />

      {/* Ring — outer positions, inner spins */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          transform: `translate3d(${ring.x}px, ${ring.y}px, 0)`,
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width:  ringSize,
            height: ringSize,
            borderRadius: '50%',
            border: hovered
              ? '1.5px dashed rgba(251,146,60,0.85)'
              : '1px dashed rgba(245,158,11,0.45)',
            background: hovered
              ? 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)'
              : 'transparent',
            top:  -ringSize / 2,
            left: -ringSize / 2,
            animation: `cursor-ring-spin ${hovered ? '2.5s' : '5s'} linear infinite`,
            transform: `scale(${ringScale})`,
            transition: [
              'width 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              'height 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              'border-color 0.2s ease',
              'background 0.25s ease',
              'transform 0.15s ease',
            ].join(', '),
            willChange: 'transform',
          }}
        />
        {/* Inject ring-specific spin that doesn't fight translate */}
        <style>{`
          @keyframes cursor-ring-spin {
            from { transform: scale(${ringScale}) rotate(0deg); }
            to   { transform: scale(${ringScale}) rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Dot — precise cursor tip, no animation just snap */}
      <div aria-hidden="true" style={dotStyle} />
    </>
  )
}

export default CustomCursor