import { useEffect, useRef, useState } from 'react'

function useSeen(threshold = 0.12) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      setSeen(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [ref, seen]
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, innerRef, ...rest }) {
  const [ref, seen] = useSeen()
  return (
    <Tag
      ref={(node) => {
        ref.current = node
        if (innerRef) innerRef(node)
      }}
      className={`reveal ${seen ? 'in' : ''} ${className}`}
      style={{ '--d': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function CountUp({ value, duration = 1500 }) {
  const match = String(value).match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : 0
  const suffix = match ? match[2] : ''
  const [ref, seen] = useSeen(0.4)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!seen) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setN(target)
      return undefined
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, target, duration])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}
