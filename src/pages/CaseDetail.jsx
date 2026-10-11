import { Link, useParams } from 'react-router-dom'
import { SITE, pick } from '../data/site'
import Body from '../components/Body'
import { useContent } from '../context/ContentContext'
import { useLang, formatDate } from '../context/LanguageContext'
import { Cover } from '../components/Cover'
import { Reveal } from '../components/Reveal'
import { CaseCard } from '../components/Cards'
import Icon from '../components/Icon'
import NotFound from './NotFound'

export default function CaseDetail() {
  const { slug } = useParams()
  const { t, lang } = useLang()
  const { cases } = useContent()
  const item = cases.find((c) => c.slug === slug)
  if (!item) return <NotFound />

  const more = cases.filter((c) => c.slug !== item.slug).slice(0, 2)

  return (
    <article className="detail">
      <div className="wrap detail-wrap">
        <Link className="back" to="/himoya-ishlari">
          <Icon name="arrowLeft" size={16} />
          {t.nav.cases}
        </Link>
        <header className="detail-head">
          <div className="meta-row">
            <span className="chip chip-success">
              <Icon name="check" size={12} stroke={2.6} />
              {t.common[item.status]}
            </span>
            <span className="chip">{pick(item.category, lang)}</span>
          </div>
          <h1>{pick(item.title, lang)}</h1>
          <p className="deck">{pick(item.excerpt, lang)}</p>
        </header>

        <div className="fact-strip">
          <div>
            <small>{t.cases.court}</small>
            <b>{pick(item.court, lang)}</b>
          </div>
          <div>
            <small>{t.cases.date}</small>
            <b>{formatDate(item.date, lang)}</b>
          </div>
          {item.amount && (
            <div>
              <small>{t.cases.outcome}</small>
              <b className="gold">{pick(item.amount, lang)}</b>
            </div>
          )}
        </div>

        <Cover src={item.image} className="detail-cover" />

        <div className="prose">
          <ol className="case-timeline">
            {item.timeline.map((step, i) => (
              <li key={`${step.date}-${i}`}>
                <b>{step.date}</b>
                <span>{pick(step, lang)}</span>
              </li>
            ))}
          </ol>
          <Body body={pick(item.body, lang)} />
        </div>

        <aside className="cta-card">
          <div>
            <h3>{t.services.ctaTitle}</h3>
            <p>{t.services.ctaText}</p>
          </div>
          <Link className="btn btn-gold" to="/aloqa">
            {t.common.consult}
            <Icon name="arrow" size={16} />
          </Link>
          <a className="cta-phone" href={SITE.phones[0].href}>
            <Icon name="phone" size={16} />
            {SITE.phones[0].display}
          </a>
        </aside>

        <h2 className="related-title">{t.common.allCases}</h2>
        <div className="grid-2">
          {more.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90}>
              <CaseCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  )
}
