import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ARTICLE_CATEGORIES } from '../data/articles'
import { pick } from '../data/site'
import { bodyText } from '../data/body'
import { useContent } from '../context/ContentContext'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { ArticleCard } from '../components/Cards'
import Icon from '../components/Icon'

export default function Articles() {
  const { t, lang } = useLang()
  const { articles, cases } = useContent()
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || 'all'
  const q = params.get('q') || ''
  const needle = q.trim().toLowerCase()

  const list = useMemo(
    () =>
      articles.filter((a) => {
        if (cat !== 'all' && a.category !== cat) return false
        if (!needle) return true
        const blob = [pick(a.title, lang), pick(a.excerpt, lang), bodyText(pick(a.body, lang))].join(' ').toLowerCase()
        return blob.includes(needle)
      }),
    [articles, cat, needle, lang],
  )

  const caseHits = useMemo(() => {
    if (!needle) return []
    return cases.filter((c) =>
      [pick(c.title, lang), pick(c.excerpt, lang)].join(' ').toLowerCase().includes(needle),
    )
  }, [cases, needle, lang])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const strip = useRef(null)
  const [edges, setEdges] = useState({ start: false, end: false })
  const measure = useCallback(() => {
    const el = strip.current
    if (!el) return
    const start = el.scrollLeft > 4
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setEdges((p) => (p.start === start && p.end === end ? p : { start, end }))
  }, [])
  const scrollBy = (dir) => {
    const el = strip.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }
  useEffect(() => {
    measure()
    const el = strip.current
    if (!el) return undefined
    const active = el.querySelector('.active')
    if (active) {
      const target = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2
      el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cat, lang, measure])

  const showFeature = list.length > 2 && !needle && cat === 'all'
  const [first, ...rest] = list

  return (
    <>
      <PageHero
        kicker={t.articles.kicker}
        title={t.articles.title}
        lead={`${articles.length} ${t.articles.count}`}
      />
      <section className="sec sec-ivory">
        <div className="wrap">
          <div className={`filter-carousel ${edges.start || edges.end ? 'scrolls' : ''}`}>
            <button
              type="button"
              className="fc-arrow prev"
              aria-label="←"
              disabled={!edges.start}
              onClick={() => scrollBy(-1)}
            >
              <Icon name="arrowLeft" size={18} />
            </button>
            <div className={`fc-viewport ${edges.start ? 'fade-start' : ''} ${edges.end ? 'fade-end' : ''}`}>
              <div className="filters" role="tablist" ref={strip} onScroll={measure}>
                {ARTICLE_CATEGORIES.map((id) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={cat === id}
                    className={cat === id ? 'active' : ''}
                    onClick={() => update('cat', id)}
                  >
                    {t.articles.cats[id]}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="fc-arrow next"
              aria-label="→"
              disabled={!edges.end}
              onClick={() => scrollBy(1)}
            >
              <Icon name="arrow" size={18} />
            </button>
          </div>

          {needle && (
            <p className="result-note">
              {t.common.resultsFor}: <strong>“{q}”</strong> — {list.length + caseHits.length}
            </p>
          )}

          {caseHits.length > 0 && (
            <div className="case-hits">
              {caseHits.map((c) => (
                <Link key={c.slug} to={`/himoya-ishlari/${c.slug}`}>
                  <Icon name="gavel" size={16} />
                  <span>{pick(c.title, lang)}</span>
                  <small>{t.nav.cases}</small>
                </Link>
              ))}
            </div>
          )}

          {list.length === 0 && caseHits.length === 0 && <p className="empty">{t.common.noResults}</p>}

          {showFeature && (
            <Reveal>
              <ArticleCard a={first} feature />
            </Reveal>
          )}
          <div className="grid-3">
            {(showFeature ? rest : list).map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 90}>
                <ArticleCard a={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
