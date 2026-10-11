import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SITE, pick } from '../data/site'
import { bodyText } from '../data/body'
import Body from '../components/Body'
import { useContent } from '../context/ContentContext'
import { useLang, formatDate } from '../context/LanguageContext'
import { Cover } from '../components/Cover'
import { Reveal } from '../components/Reveal'
import { ArticleCard } from '../components/Cards'
import Icon from '../components/Icon'
import NotFound from './NotFound'

export default function ArticleDetail() {
  const { slug } = useParams()
  const { t, lang, tr } = useLang()
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const { articles } = useContent()
  const item = articles.find((a) => a.slug === slug)

  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? h.scrollTop / max : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [slug])

  if (!item) return <NotFound />

  const related = articles.filter((a) => a.slug !== item.slug).slice(0, 3)
  const url = window.location.href
  const words = bodyText(pick(item.body, lang)).split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <article className="detail">
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="wrap detail-wrap">
        <Link className="back" to="/maqolalar">
          <Icon name="arrowLeft" size={16} />
          {t.common.allArticles}
        </Link>

        <header className="detail-head">
          <div className="meta-row">
            <span className="chip chip-gold">{t.articles.cats[item.category]}</span>
            <span className="meta-i">
              <Icon name="calendar" size={14} />
              {formatDate(item.date, lang)}
            </span>
            <span className="meta-i">
              <Icon name="clock" size={14} />
              {minutes} min
            </span>
          </div>
          <h1>{pick(item.title, lang)}</h1>
          <p className="deck">{pick(item.excerpt, lang)}</p>
          <div className="byline">
            <span className="avatar">{tr(SITE.initials)}</span>
            <div>
              <strong>{tr(SITE.name)}</strong>
              <small>{t.common.authorRole}</small>
            </div>
          </div>
        </header>

        <Cover src={item.image} className="detail-cover" />

        <div className="prose dropcap">
          <Body body={pick(item.body, lang)} />
        </div>

        <div className="prose-foot">
          <div className="tags">
            {(pick(item.tags, lang) || []).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          <div className="share">
            <span>{t.common.share}</span>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">
              <Icon name="telegram" size={16} />
              Telegram
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <button type="button" onClick={copy}>
              <Icon name={copied ? 'check' : 'link'} size={16} />
              {copied ? t.common.copied : t.common.copyLink}
            </button>
          </div>
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

        <h2 className="related-title">{t.common.related}</h2>
        <div className="grid-3">
          {related.map((a, i) => (
            <Reveal key={a.slug} delay={i * 90}>
              <ArticleCard a={a} />
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  )
}
