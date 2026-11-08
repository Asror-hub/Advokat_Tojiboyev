import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { Reveal } from './Reveal'
import Icon from './Icon'

// Certificate scans: drop images into src/assets/certificates/ (jpg, jpeg, png or webp).
// They are picked up automatically, sorted by file name; the file name becomes the caption
// (e.g. "mediation-training-2024.jpg" -> "mediation training 2024"). With no images, three
// clearly marked placeholders are shown instead.
const files = import.meta.glob('../assets/certificates/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const scans = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({
    src,
    caption: path
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' '),
  }))

export default function Certificates() {
  const { t } = useLang()
  const [open, setOpen] = useState(null)
  const words = t.home.certsTitle.split(' ')

  useEffect(() => {
    if (open === null) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const placeholders = [0, 1, 2]

  return (
    <section className="sec sec-paper certs" id="sertifikatlar">
      <div className="wrap">
        <Reveal className="center-head services-head">
          <h2>
            {words.length > 1 ? words.slice(0, -1).join(' ') + ' ' : ''}
            <em>{words[words.length - 1]}</em>
          </h2>
          <span className="orn" aria-hidden="true" />
          <p className="center-lead">{t.home.certsLead}</p>
        </Reveal>

        <div className="cert-grid">
          {scans.length > 0
            ? scans.map((c, i) => (
                <Reveal key={c.src} delay={(i % 3) * 90}>
                  <button type="button" className="cert-card" onClick={() => setOpen(i)} aria-label={c.caption}>
                    <span className="cert-frame">
                      <img src={c.src} alt={c.caption} loading="lazy" />
                    </span>
                    <span className="cert-caption">{c.caption}</span>
                  </button>
                </Reveal>
              ))
            : placeholders.map((i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="cert-card is-placeholder">
                    <span className="cert-frame">
                      <span className="cert-paper">
                        <Icon name="scale" size={30} stroke={1.3} />
                        <b>{t.home.certsPh.t}</b>
                        <i aria-hidden="true" />
                        <small>{t.home.certsPh.i}</small>
                        <small>{t.home.certsPh.y}</small>
                      </span>
                    </span>
                  </div>
                </Reveal>
              ))}
        </div>

        <p className="certs-note">{t.home.certsNote}</p>
      </div>

      {open !== null && scans[open] && (
        <div className="cert-lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <button type="button" className="cert-close" aria-label={t.common.close} onClick={() => setOpen(null)}>
            <Icon name="close" size={22} />
          </button>
          <img src={scans[open].src} alt={scans[open].caption} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
