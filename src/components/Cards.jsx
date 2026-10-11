import { Link } from 'react-router-dom'
import { pick } from '../data/site'
import { formatDate, useLang } from '../context/LanguageContext'
import { Cover } from './Cover'
import Icon from './Icon'

export function ArticleCard({ a, feature = false }) {
  const { t, lang } = useLang()
  return (
    <Link to={`/maqolalar/${a.slug}`} className={`acard ${feature ? 'feature' : ''}`}>
      <div className="acard-media">
        <Cover src={a.image} />
        <span className="cover-tag">{t.articles.cats[a.category]}</span>
      </div>
      <div className="acard-body">
        <div className="meta">
          <Icon name="calendar" size={14} />
          <span>{formatDate(a.date, lang)}</span>
        </div>
        <h3>{pick(a.title, lang)}</h3>
        <p>{pick(a.excerpt, lang)}</p>
        <span className="more">
          {t.common.readMore}
          <Icon name="arrow" size={16} />
        </span>
      </div>
    </Link>
  )
}

export function CaseCard({ c, feature = false }) {
  const { t, lang } = useLang()
  return (
    <Link to={`/himoya-ishlari/${c.slug}`} className={`acard case ${feature ? 'feature' : ''}`}>
      <div className="acard-media">
        <Cover src={c.image} />
        <span className="cover-tag success">
          <Icon name="check" size={12} stroke={2.4} />
          {t.common[c.status]}
        </span>
        {c.amount && <span className="cover-amount">{pick(c.amount, lang)}</span>}
      </div>
      <div className="acard-body">
        <div className="meta">
          <Icon name="building" size={14} />
          <span>{pick(c.court, lang)}</span>
          <span className="sep">·</span>
          <span>{formatDate(c.date, lang)}</span>
        </div>
        <h3>{pick(c.title, lang)}</h3>
        <p>{pick(c.excerpt, lang)}</p>
        <span className="more">
          {t.common.readMore}
          <Icon name="arrow" size={16} />
        </span>
      </div>
    </Link>
  )
}
