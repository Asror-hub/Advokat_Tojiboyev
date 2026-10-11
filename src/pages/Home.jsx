import { Link } from 'react-router-dom'
import { SITE, pick } from '../data/site'
import { useContent } from '../context/ContentContext'
import { useLang, formatDate } from '../context/LanguageContext'
import { Reveal, CountUp } from '../components/Reveal'
import { Portrait } from '../components/Cover'
import { ArticleCard } from '../components/Cards'
import Cycle from '../components/Cycle'
import Icon, { SERVICE_ICONS } from '../components/Icon'

const CYCLE_ICONS = ['search', 'file', 'gavel', 'scale', 'shield', 'unlock']

export default function Home() {
  const { t, lang } = useLang()
  const { articles, cases } = useContent()
  const latest = articles.slice(0, 3)
  const services = t.services.items.slice(0, 4)
  const feature = cases[0]
  const ribbon = [...t.home.ribbon, ...t.home.ribbon, ...t.home.ribbon, ...t.home.ribbon]
  const servicesWords = t.home.servicesTitle.split(' ')
  const processWords = t.home.processTitle.split(' ')
  const articlesWords = t.home.articlesTitle.split(' ')
  const [first, ...rest] = t.home.title.split(' ')
  const statLabel = { years: t.home.yearsLabel, cases: t.home.casesLabel, success: t.home.successLabel }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Reveal delay={80}>
              <p className="hero-role">{t.home.role}</p>
            </Reveal>
            <Reveal delay={160}>
              <h1 className="display">
                <span>{first}</span> <em>{rest.join(' ')}</em>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="hero-quote">{t.home.quote}</p>
            </Reveal>
            <div className="hero-actions">
              <Link className="btn btn-gold btn-lg" to={{ hash: 'aloqa' }}>
                {t.common.consult}
                <Icon name="arrow" size={18} />
              </Link>
              <a className="btn btn-ghost btn-lg" href={SITE.telegram} target="_blank" rel="noreferrer">
                <Icon name="telegram" size={18} />
                {t.common.telegram}
              </a>
            </div>
          </div>

          <Reveal className="hero-art" delay={200}>
            <div className="arch-wrap">
              <Portrait photo={SITE.photo} />
            </div>
          </Reveal>
        </div>

        <div className="wrap">
          <div className="hero-stats">
            {SITE.stats.map((s) => (
              <div className="stat" key={s.key}>
                <b>
                  <CountUp value={s.value} />
                </b>
                <span>{statLabel[s.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="ribbon" aria-hidden="true">
        <div className="ribbon-track">
          {ribbon.map((item, i) => (
            <span key={i}>
              {item}
              <Icon name="scale" size={30} stroke={1.3} />
            </span>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="sec sec-ivory">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {servicesWords.slice(0, -1).join(' ')} <em>{servicesWords[servicesWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.home.servicesLead}</p>
          </Reveal>
          <div className="bento">
            {services.map((item, i) => (
              <Reveal
                as={Link}
                to="/xizmatlar"
                key={item.n}
                delay={i * 90}
                className={`bcard ${i === 0 || i === 3 ? 'dark' : ''}`}
              >
                <span className="bcard-num" aria-hidden="true">
                  {item.n}
                </span>
                <span className="bicon">
                  <Icon name={SERVICE_ICONS[i]} size={26} />
                </span>
                <h3>{item.t}</h3>
                <ul>
                  {item.points.slice(0, 2).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="sec-more">
            <Link className="btn btn-navy btn-lg" to="/xizmatlar">
              {t.common.allServices}
              <Icon name="arrow" size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FEATURED RESULT */}
      {feature && (
      <section className="sec sec-dark featured">
        <div className="featured-glow" aria-hidden="true" />
        <div className="wrap">
          <Reveal className="center-head services-head">
            <div className="kicker">{t.home.featuredKicker}</div>
            <span className="orn" aria-hidden="true" />
          </Reveal>
        </div>
        <div className="wrap featured-grid">
          <Reveal delay={80} className="feature-head">
            <div className="feature-meta">
              <span>{pick(feature.category, lang)}</span>
              <i aria-hidden="true" />
              <span>{formatDate(feature.date, lang)}</span>
            </div>
            <h2>{pick(feature.title, lang)}</h2>
          </Reveal>
          <Reveal delay={140} className="featured-card">
            <p>{pick(feature.excerpt, lang)}</p>
            <ol className="mini-timeline">
              {feature.timeline.map((step, i) => (
                <li key={`${step.date}-${i}`}>
                  <b>{step.date}</b>
                  <span>{pick(step, lang)}</span>
                </li>
              ))}
            </ol>
            <Link className="btn btn-ghost" to={`/himoya-ishlari/${feature.slug}`}>
              {t.home.viewCase}
              <Icon name="arrow" size={16} />
            </Link>
          </Reveal>
        </div>
        <div className="wrap">
          <Reveal className="sec-more">
            <Link className="btn btn-gold btn-lg" to="/himoya-ishlari">
              {t.common.viewAllCases}
              <Icon name="arrow" size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
      )}

      {/* PROCESS */}
      <section className="sec sec-paper cycle">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {processWords.slice(0, -1).join(' ')} <em>{processWords[processWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.home.processLead}</p>
          </Reveal>
          <Cycle steps={t.home.process} icons={CYCLE_ICONS} />
        </div>
      </section>

      {/* ARTICLES */}
      <section className="sec sec-ivory">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {articlesWords.slice(0, -1).join(' ')} <em>{articlesWords[articlesWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
          </Reveal>
          <div className="grid-3">
            {latest.map((a, i) => (
              <Reveal key={a.slug} delay={i * 100}>
                <ArticleCard a={a} />
              </Reveal>
            ))}
          </div>
          <Reveal className="sec-more">
            <Link className="btn btn-navy btn-lg" to="/maqolalar">
              {t.common.allArticles}
              <Icon name="arrow" size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
