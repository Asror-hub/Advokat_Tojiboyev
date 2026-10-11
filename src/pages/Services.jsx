import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import Cycle from '../components/Cycle'
import Icon, { SERVICE_ICONS } from '../components/Icon'

const CYCLE_ICONS = ['search', 'file', 'gavel', 'scale', 'shield', 'unlock']
// lawyer, silence, charge, case file, complaint, expert examination
const RIGHT_ICONS = ['users', 'lock', 'file', 'search', 'scale', 'flask']

export default function Services() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  const cycleWords = t.services.cycleTitle.split(' ')
  const rightsWords = t.services.rightsTitle.split(' ')

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
                  <span className="acc-toggle" aria-hidden="true">
                    <Icon name="chevronDown" size={20} stroke={1.8} />
                  </span>
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

      <section className="sec sec-paper cycle">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {cycleWords.slice(0, -1).join(' ')} <em>{cycleWords[cycleWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.services.cycleText}</p>
          </Reveal>
          <Cycle steps={t.home.process} icons={CYCLE_ICONS} />
        </div>
      </section>

      <section className="sec sec-ivory">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <div className="kicker">{t.services.rightsKicker}</div>
            <h2>
              {rightsWords.slice(0, -1).join(' ')} <em>{rightsWords[rightsWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.services.rightsLead}</p>
          </Reveal>
          <div className="bento rights">
            {t.services.rights.map((r, i) => (
              <Reveal
                key={r}
                delay={(i % 3) * 90}
                className="bcard"
              >
                <span className="bcard-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="bicon">
                  <Icon name={RIGHT_ICONS[i]} size={26} />
                </span>
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
              <Link className="btn btn-gold btn-lg" to={{ hash: 'aloqa' }}>
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
