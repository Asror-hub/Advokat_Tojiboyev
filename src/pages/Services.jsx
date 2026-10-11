import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import Icon, { SERVICE_ICONS } from '../components/Icon'

export default function Services() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)

  return (
    <>
      <PageHero kicker={t.services.kicker} title={t.services.title} lead={t.services.lead} />

      <section className="sec sec-ivory">
        <div className="wrap narrow">
          <div className="accordion">
            {t.services.items.map((item, i) => (
              <Reveal key={item.n} delay={Math.min(i, 4) * 60} className={open === i ? 'acc open' : 'acc'}>
                <button
                  className="acc-head"
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                >
                  <span className="bicon">
                    <Icon name={SERVICE_ICONS[i]} size={24} />
                  </span>
                  <span className="acc-title">
                    <small>
                      {item.n} · {item.k}
                    </small>
                    <strong>{item.t}</strong>
                  </span>
                  <span className="acc-toggle" aria-hidden="true" />
                </button>
                <div className="acc-panel">
                  <div>
                    <ul>
                      {item.points.map((p, j) => (
                        <li key={p} style={{ '--i': j }}>
                          <Icon name="check" size={14} stroke={2.6} />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="acc-foot">
                      <Link to="/aloqa">
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

      <section className="sec sec-dark">
        <div className="wrap">
          <Reveal className="center-head">
            <div className="kicker kicker-line">{t.services.kicker}</div>
            <h2>{t.services.cycleTitle}</h2>
            <p className="center-lead">{t.services.cycleText}</p>
          </Reveal>
          <div className="steps six on-dark">
            {t.home.process.map((step, i) => (
              <Reveal className="step" key={step.n} delay={i * 110}>
                <span className="node">{step.n}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-paper">
        <div className="wrap">
          <Reveal className="center-head">
            <div className="kicker kicker-line">{t.services.rightsKicker}</div>
            <h2>{t.services.rightsTitle}</h2>
            <p className="center-lead">{t.services.rightsLead}</p>
          </Reveal>
          <div className="rights">
            {t.services.rights.map((r, i) => (
              <Reveal className="right" key={r} delay={(i % 3) * 80}>
                <span className="right-n">{String(i + 1).padStart(2, '0')}</span>
                <p>{r}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="final compact">
        <div className="final-glow" aria-hidden="true" />
        <div className="wrap final-inner">
          <Reveal>
            <h2>{t.services.ctaTitle}</h2>
            <p className="final-text">{t.services.ctaText}</p>
            <div className="hero-actions center">
              <Link className="btn btn-gold btn-lg" to="/aloqa">
                {t.common.consult}
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
