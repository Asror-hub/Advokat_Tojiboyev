import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLang } from '../context/LanguageContext'
import { Reveal } from '../components/Reveal'
import { HeroScene } from '../components/Cover'
import { ArticleCard, CaseCard } from '../components/Cards'
import Certificates from '../components/Certificates'
import Testimonials from '../components/Testimonials'
import TeamCarousel from '../components/TeamCarousel'
import Cycle from '../components/Cycle'
import Icon, { SERVICE_ICONS } from '../components/Icon'

const CYCLE_ICONS = ['search', 'file', 'gavel', 'scale', 'shield', 'unlock']

export default function Home() {
  const { t } = useLang()
  const { articles, cases } = useContent()
  const latest = articles.slice(0, 3)
  const services = t.services.items.slice(0, 4)
  const wins = cases.filter((c) => c.status === 'successful').slice(0, 3)
  const ribbon = [...t.home.ribbon, ...t.home.ribbon, ...t.home.ribbon, ...t.home.ribbon]
  const servicesWords = t.home.servicesTitle.split(' ')
  const processWords = t.home.processTitle.split(' ')
  const articlesWords = t.home.articlesTitle.split(' ')
  const teamWords = t.home.teamTitle.split(' ')
  const winsWords = t.home.winsTitle.split(' ')

  return (
    <>
      {/* HERO */}
      <section className="hero-lux">
        <div className="hero-lux-bg" aria-hidden="true">
          <HeroScene />
        </div>
        <div className="wrap hero-lux-inner">
          <div className="hero-lux-copy">
            <Reveal delay={60}>
              <p className="hero-lux-kicker">
                <span>{t.home.kicker}</span>
                <i />
              </p>
            </Reveal>
            <Reveal delay={140}>
              <h1 className="hero-lux-title">
                <span className="hl-brand">TEN Duayen</span>
                <span className="hl-by">by Tojiboev’s</span>
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="hero-lux-tag">{t.footer.tagline}</p>
            </Reveal>
            <Reveal delay={300} className="hero-lux-actions">
              <Link className="btn btn-gold btn-lg" to={{ hash: 'aloqa' }}>
                {t.common.consult}
                <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn btn-lux-outline btn-lg" to="/xizmatlar">
                {t.common.exploreServices}
              </Link>
            </Reveal>
          </div>
          <ul className="hero-lux-words">
            {t.home.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
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

      {/* CERTIFICATES */}
      <Certificates />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CASES WE WON */}
      {wins.length > 0 && (
        <section className="sec sec-paper win-sec">
          <div className="wrap">
            <Reveal className="center-head services-head">
              <h2>
                {winsWords.slice(0, -1).join(' ')} <em>{winsWords[winsWords.length - 1]}</em>
              </h2>
              <span className="orn" aria-hidden="true" />
              <p className="center-lead">{t.home.winsLead}</p>
            </Reveal>

            <Reveal>
              <CaseCard c={wins[0]} feature />
            </Reveal>
            {wins.length > 1 && (
              <div className="grid-2">
                {wins.slice(1).map((c, i) => (
                  <Reveal key={c.slug} delay={(i % 2) * 100}>
                    <CaseCard c={c} />
                  </Reveal>
                ))}
              </div>
            )}

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

      {/* TEAM */}
      <section className="sec tm-light">
        <div className="wrap">
          <Reveal className="center-head services-head">
            <h2>
              {teamWords.slice(0, -1).join(' ')} <em>{teamWords[teamWords.length - 1]}</em>
            </h2>
            <span className="orn" aria-hidden="true" />
            <p className="center-lead">{t.home.teamLead}</p>
          </Reveal>
        </div>
        <TeamCarousel members={t.team.members} />
      </section>

      {/* ARTICLES */}
      <section className="sec sec-ivory art-white">
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
