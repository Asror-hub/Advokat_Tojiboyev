import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { Reveal } from './Reveal'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Process stepper. A glowing dot travels along the connecting line while the
 * visitor scrolls and "lands" on each step, lighting it up.
 * - desktop (> 1100px): the line is horizontal
 * - tablet / mobile: the line is vertical, steps are rows
 */
export default function Cycle({ steps, icons }) {
  const box = useRef(null)
  const track = useRef(null)
  const fill = useRef(null)
  const dot = useRef(null)
  const nodes = useRef([])
  const steps$ = useRef([])
  const [reached, setReached] = useState(0)
  const reachedRef = useRef(0)

  useEffect(() => {
    const el = box.current
    if (!el) return undefined
    let raf = 0

    const update = () => {
      raf = 0
      const vertical = window.matchMedia('(max-width: 1100px)').matches
      const vh = window.innerHeight
      const rect = el.getBoundingClientRect()

      // Node centres relative to the container (transform independent)
      const centers = nodes.current.map((n, i) => {
        const s = steps$.current[i]
        return {
          x: s.offsetLeft + n.offsetLeft + n.offsetWidth / 2,
          y: s.offsetTop + n.offsetTop + n.offsetHeight / 2,
        }
      })
      if (!centers.length) return
      const first = centers[0]
      const last = centers[centers.length - 1]

      let pos
      if (vertical) {
        pos = vh * 0.55 - rect.top
        pos = clamp(pos, first.y, last.y)
      } else {
        const p = clamp((vh * 0.88 - rect.top) / (vh * 0.5), 0, 1)
        pos = first.x + (last.x - first.x) * p
      }

      const t = track.current
      const f = fill.current
      const d = dot.current
      if (vertical) {
        t.style.cssText = `left:${first.x - 1}px;top:${first.y}px;width:2px;height:${last.y - first.y}px`
        f.style.cssText = `left:${first.x - 1}px;top:${first.y}px;width:2px;height:${pos - first.y}px`
        d.style.transform = `translate(${first.x}px, ${pos}px)`
      } else {
        t.style.cssText = `left:${first.x}px;top:${first.y - 1}px;height:2px;width:${last.x - first.x}px`
        f.style.cssText = `left:${first.x}px;top:${first.y - 1}px;height:2px;width:${pos - first.x}px`
        d.style.transform = `translate(${pos}px, ${first.y}px)`
      }

      let idx = 0
      centers.forEach((c, i) => {
        const v = vertical ? c.y : c.x
        if (v <= pos + 2) idx = i
      })
      if (idx !== reachedRef.current) {
        reachedRef.current = idx
        setReached(idx)
      }
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    if (ro) ro.observe(el)
    const late = setTimeout(update, 400)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (ro) ro.disconnect()
      clearTimeout(late)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [steps.length])

  return (
    <div className="cycle-steps" ref={box} style={{ '--n': steps.length }}>
      <span className="cycle-track" ref={track} aria-hidden="true" />
      <span className="cycle-fill" ref={fill} aria-hidden="true" />
      <span className="cycle-dot" ref={dot} aria-hidden="true">
        <i />
      </span>
      {steps.map((step, i) => (
        <Reveal
          className={`cstep ${i <= reached ? 'is-active' : ''} ${i === reached ? 'is-current' : ''}`}
          key={step.n}
          delay={i * 110}
          innerRef={(node) => {
            steps$.current[i] = node
          }}
        >
          <span
            className="cnode"
            ref={(node) => {
              nodes.current[i] = node
            }}
          >
            <Icon name={icons[i]} size={30} stroke={1.5} />
            <b>{step.n}</b>
          </span>
          <div className="ccard">
            <h3>{step.t}</h3>
            <p>{step.d}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
