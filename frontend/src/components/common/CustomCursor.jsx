// Purpose: Renders a premium custom cursor with delayed ring follow and hover interactions.
// All logic identical to original — only visual style of the cursor elements changes via CSS.
import { useEffect, useState } from 'react'

const CustomCursor = () => {
  const [dot, setDot] = useState({ x: 0, y: 0 })
  const [ring, setRing] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return undefined

    document.body.classList.add('custom-cursor-enabled')

    let animationFrameId = null
    let target = { x: 0, y: 0 }

    const animateRing = () => {
      setRing((prev) => ({
        x: prev.x + (target.x - prev.x) * 0.16,
        y: prev.y + (target.y - prev.y) * 0.16,
      }))
      animationFrameId = requestAnimationFrame(animateRing)
    }
    animationFrameId = requestAnimationFrame(animateRing)

    const handleMove = (e) => {
      target = { x: e.clientX, y: e.clientY }
      setDot({ x: e.clientX, y: e.clientY })
    }
    const handleOver = (e) => {
      setHovered(Boolean(e.target.closest('button, a, [role="button"], input, textarea, select')))
    }
    const handleOut = () => setHovered(false)
    const handleLeave = () => setHidden(true)
    const handleEnter = () => setHidden(false)
    const handleDown = () => setClicking(true)
    const handleUp = () => setClicking(false)

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('mouseup', handleUp)

    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [])

  return (
    <>
      {/* Dot — the precise cursor tip */}
      <div
        className={`custom-cursor-dot ${hovered ? 'is-hovered' : ''} ${hidden ? 'is-hidden' : ''} ${clicking ? 'is-clicking' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: hovered ? '8px' : '6px',
          height: hovered ? '8px' : '6px',
          borderRadius: '50%',
          background: hovered
            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
            : '#f59e0b',
          boxShadow: hovered ? '0 0 8px rgba(251,191,36,0.8)' : '0 0 4px rgba(251,191,36,0.5)',
          transform: `translate3d(calc(${dot.x}px - 50%), calc(${dot.y}px - 50%), 0) scale(${clicking ? 0.7 : 1})`,
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          opacity: hidden ? 0 : 1,
          willChange: 'transform',
        }}
      />

      {/* Ring — the trailing orbital */}
      <div
        className={`custom-cursor-ring ${hovered ? 'is-hovered' : ''} ${hidden ? 'is-hidden' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: hovered ? '44px' : '32px',
          height: hovered ? '44px' : '32px',
          borderRadius: '50%',
          border: `1.5px solid ${hovered ? 'rgba(251,191,36,0.7)' : 'rgba(251,191,36,0.35)'}`,
          background: hovered ? 'rgba(251,191,36,0.06)' : 'transparent',
          transform: `translate3d(calc(${ring.x}px - 50%), calc(${ring.y}px - 50%), 0) scale(${clicking ? 0.85 : 1})`,
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, background 0.2s ease',
          opacity: hidden ? 0 : 1,
          willChange: 'transform',
        }}
      />
    </>
  )
}

export default CustomCursor