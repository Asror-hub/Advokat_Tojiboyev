import { useEffect, useRef } from 'react'
import TeamCard from './TeamCard'

const MAX_SPEED = 620 // px per second at the very edge of the row
const DEAD_ZONE = 0.12 // fraction of half-width around the centre where nothing moves

// One line of team cards. While the mouse is over the row, the cards slide against the
// cursor: pointer on the right half -> cards move left, pointer on the left half -> cards
// move right, faster the further the pointer is from the centre. The list is rendered twice
// and the offset wraps, so it never runs out. Touch screens and reduced-motion users get a
// plain swipeable row instead (see the .tc-row rules in index.css).
export default function TeamCarousel({ members }) {
  const rowRef = useRef(null)
  const trackRef = useRef(null)
  const count = members.length

  useEffect(() => {
    const row = rowRef.current
    const track = trackRef.current
    if (!row || !track) return undefined
    if (window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let x = 0
    let velocity = 0
    let target = 0
    let half = 0
    let raf = 0
    let last = 0

    const measure = () => {
      const slides = track.children
      if (slides[count] && slides[0]) half = slides[count].offsetLeft - slides[0].offsetLeft
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      velocity += (target - velocity) * Math.min(1, dt * 6)
      if (target === 0 && Math.abs(velocity) < 0.5) velocity = 0
      x += velocity * dt
      if (half) {
        while (x <= -half) x += half
        while (x > 0) x -= half
      }
      track.style.transform = `translate3d(${x}px, 0, 0)`
      raf = velocity !== 0 || target !== 0 ? requestAnimationFrame(tick) : 0
    }

    const start = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      const rect = row.getBoundingClientRect()
      const rel = ((e.clientX - rect.left) / rect.width) * 2 - 1 // -1 (left edge) .. 1 (right edge)
      const strength = Math.abs(rel) < DEAD_ZONE ? 0 : (rel - Math.sign(rel) * DEAD_ZONE) / (1 - DEAD_ZONE)
      target = -strength * MAX_SPEED
      start()
    }
    const onLeave = () => {
      target = 0
      start()
    }

    measure()
    window.addEventListener('resize', measure)
    row.addEventListener('pointermove', onMove)
    row.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('resize', measure)
      row.removeEventListener('pointermove', onMove)
      row.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [count])

  return (
    <div className="tc-row" ref={rowRef}>
      <div className="tc-track" ref={trackRef}>
        {[...members, ...members].map((m, i) => (
          <div className="tc-slide" key={`${m.role}-${i}`} aria-hidden={i >= count ? 'true' : undefined}>
            <TeamCard member={m} index={i % count} reveal={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
