import { Link } from 'react-router-dom'
import { SITE } from '../data/site'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal, CountUp } from '../components/Reveal'
import { Portrait } from '../components/Cover'
import Icon from '../components/Icon'

const PRINCIPLE_ICONS = ['scale', 'users', 'shield']

export default function About() {
  const { t } = useLang()
  const statLabel = { years: t.home.yearsLabel, cases: t.home.casesLabel, success: t.home.successLabel }

  return (
    <>
      <PageHero kicker={t.about.kicker} title={t.about.title} lead={t.about.role} />

      <section className="sec sec-ivory">
        <div className="wrap about-grid">
          <aside className="about-side">
            <Reveal>
              <div className="arch-wrap small">
                <Portrait photo={SITE.photo} />
              </div>
            </Reveal>
            <Reveal delay={120} className="facts">
              <div>
                <Icon name="gavel" size={18} />
                <span>
                  <small>{t.about.spec}</small>
                  {t.about.specVal}
                </span>
              </div>
              <div>
                <Icon name="shield" size={18} />
                <span>
                  <small>{t.about.position}</small>
                  {t.about.positionVal}
                </span>
              </div>
              <div>
                <Icon name="pin" size={18} />
                <span>
                  <small>{t.about.location}</small>
                  {t.about.locationVal}
                </span>
              </div>
            </Reveal>
          </aside>

          <div className="about-main">
            <Reveal>
              <p className="lead-big">{t.about.p1}</p>
            </Reveal>
            <Reveal className="about-stats">
              {SITE.stats.map((s) => (
                <div key={s.key}>
                  <b>
                    <CountUp value={s.value} />
                  </b>
                  <span>{statLabel[s.key]}</span>
                </div>
              ))}
            </Reveal>
            <Reveal>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
              <p>{t.about.p4}</p>
            </Reveal>
            <Reveal className="hero-actions dark-text">
              <Link className="btn btn-navy btn-lg" to="/aloqa">
                {t.common.consult}
                <Icon name="arrow" size={18} />
              </Link>
              <a className="btn btn-outline btn-lg" href={SITE.telegram} target="_blank" rel="noreferrer">
                <Icon name="telegram" size={18} />
                {t.common.telegram}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec sec-dark">
        <div className="wrap">
          <Reveal className="center-head">
            <div className="kicker kicker-line">{t.about.kicker}</div>
            <h2>{t.about.principlesTitle}</h2>
          </Reveal>
          <div className="grid-3">
            {t.about.principles.map((p, i) => (
              <Reveal key={p.t} delay={i * 100} className="pcard">
                <span className="bicon">
                  <Icon name={PRINCIPLE_ICONS[i]} size={26} />
                </span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-paper">
        <div className="wrap narrow">
          <Reveal className="center-head">
            <div className="kicker kicker-line">{t.about.kicker}</div>
            <h2>{t.about.awards}</h2>
          </Reveal>
          <div className="vtimeline">
            {t.about.awardItems.map((a, i) => (
              <Reveal className="vt-item" key={a.y} delay={i * 80}>
                <span className="vt-year">{a.y}</span>
                <div className="vt-card">
                  <h3>{a.t}</h3>
                  <p>{a.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
