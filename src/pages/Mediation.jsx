import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import Icon from '../components/Icon'

export default function Mediation() {
  const { t } = useLang()
  const m = t.mediation

  return (
    <>
      <PageHero kicker={m.kicker} title={m.title}>
        <p className="page-lead">
          <strong className="lead-brand">{m.heading}.</strong> {m.lead}
        </p>
      </PageHero>

      <section className="sec sec-ivory">
        <div className="wrap narrow">
          <Reveal className="center-head">
            <h2>{m.areasTitle}</h2>
          </Reveal>
          <div className="acc-area-grid">
            {m.areas.map((a, i) => (
              <Reveal key={a.t} delay={(i % 2) * 80} className="acc-area">
                <strong>{a.t}</strong>
                <p>{a.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-paper">
        <div className="wrap narrow">
          <Reveal className="center-head">
            <h2>{m.stepsTitle}</h2>
          </Reveal>
          <div className="vtimeline">
            {m.steps.map((s, i) => (
              <Reveal className="vt-item" key={s} delay={i * 60}>
                <span className="vt-year">{String(i + 1).padStart(2, '0')}</span>
                <div className="vt-card">
                  <p>{s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-dark">
        <div className="wrap narrow">
          <Reveal className="center-head">
            <h2>{m.principlesTitle}</h2>
          </Reveal>
          <Reveal className="acc-principles">
            <ul>
              {m.principles.map((p, j) => (
                <li key={p} style={{ '--i': j }}>
                  <Icon name="check" size={14} stroke={2.6} />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="center-head services-head">
            <h2>{m.ctaTitle}</h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{m.ctaText}</p>
            <Link className="btn btn-gold btn-lg" to={{ hash: 'aloqa' }}>
              {t.common.applyMediation}
              <Icon name="arrow" size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
