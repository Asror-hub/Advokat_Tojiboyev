import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../data/site'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import Icon, { SERVICE_ICONS } from '../components/Icon'
import servicesImage from '../assets/services.jpg'

export default function Services() {
  const { t } = useLang()
  // Every service opens and closes on its own, so opening one never moves the content above it
  // (the old one-at-a-time behaviour made the page jump). On phones all start closed; on larger
  // screens the first one is open.
  const [openSet, setOpenSet] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches ? [] : [0],
  )
  const toggle = (i) => setOpenSet((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))

  const approachWords = t.services.approachTitle.split(' ')

  return (
    <>
      <PageHero light image={servicesImage} title={t.services.title} kicker={SITE.practice}>
        <p className="page-lead">{t.services.lead}</p>
        {t.services.lead2 && <p className="page-lead">{t.services.lead2}</p>}
        <div className="phl-actions">
          <Link className="btn btn-gold btn-lg" to={{ hash: 'aloqa' }}>
            {t.common.consult}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </PageHero>

      <section className="sec sec-ivory svc-list">
        <div className="wrap narrow">
          <div className="accordion">
            {t.services.items.map((item, i) => (
              <Reveal key={item.n} delay={Math.min(i, 4) * 60} className={openSet.includes(i) ? 'acc open' : 'acc'}>
                <button
                  className="acc-head"
                  onClick={() => toggle(i)}
                  aria-expanded={openSet.includes(i)}
                >
                  <span className="acc-num" aria-hidden="true">
                    {item.n}
                  </span>
                  <span className="bicon">
                    <Icon name={SERVICE_ICONS[i]} size={26} stroke={1.5} />
                  </span>
                  <span className="acc-title">
                    <small>{item.k}</small>
                    <strong>{item.t}</strong>
                  </span>
                  <span className="acc-toggle" aria-hidden="true">
                    <Icon name="chevronDown" size={20} stroke={1.8} />
                  </span>
                </button>
                <div className="acc-panel">
                  <div>
                    {item.intro?.map((p) => (
                      <p key={p} className="acc-intro">
                        {p}
                      </p>
                    ))}
                    {item.points && (
                      <ul>
                        {item.points.map((p, j) => (
                          <li key={p} style={{ '--i': j }}>
                            <Icon name="check" size={14} stroke={2.6} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.areas && (
                      <div className="acc-areas">
                        <h3>{item.areasTitle}</h3>
                        <div className="acc-area-grid">
                          {item.areas.map((a) => (
                            <div key={a.t} className="acc-area">
                              <strong>{a.t}</strong>
                              <p>{a.d}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.principles && (
                      <div className="acc-principles">
                        <h3>{item.principlesTitle}</h3>
                        <ul>
                          {item.principles.map((p, j) => (
                            <li key={p} style={{ '--i': j }}>
                              <Icon name="check" size={14} stroke={2.6} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.note && <p className="acc-note">{item.note}</p>}
                    <div className="acc-foot">
                      <Link to={{ hash: 'aloqa' }}>
                        {t.common.consult}
                        <Icon name="arrow" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-paper">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {approachWords.slice(0, -1).join(' ')} <em>{approachWords[approachWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.services.approachLead}</p>
            <p className="center-lead">{t.services.approachText}</p>
          </Reveal>
          <div className="bento rights approach">
            {t.services.approachValues.map((r, i) => (
              <Reveal key={r} delay={(i % 4) * 90} className="bcard">
                <span className="bcard-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p>{r}</p>
              </Reveal>
            ))}
          </div>
          <p className="services-tagline">{t.services.tagline}</p>
          <p className="services-note">{t.services.disclaimer}</p>
        </div>
      </section>
    </>
  )
}
