import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SITE, pick } from '../data/site'
import { useLang } from '../context/LanguageContext'
import Icon from './Icon'
import Flag from './Flag'

export function Logo({ light = false }) {
  const { t, tr } = useLang()
  return (
    <Link to="/" className={`logo ${light ? 'light' : ''}`} aria-label={tr(SITE.brand)}>
      <svg className="logo-crest" viewBox="0 0 48 56" aria-hidden="true">
        <defs>
          <linearGradient id="crest-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d4378" />
            <stop offset="1" stopColor="#08121f" />
          </linearGradient>
          <linearGradient id="crest-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0dca4" />
            <stop offset=".55" stopColor="#c9a85c" />
            <stop offset="1" stopColor="#a8873f" />
          </linearGradient>
        </defs>
        <path
          d="M24 2.5 43 8.5v18.2c0 12.2-8 21.4-19 26.8C13 48.1 5 38.9 5 26.7V8.5z"
          fill="url(#crest-fill)"
          stroke="url(#crest-gold)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M24 7.2 39 12v14.5c0 9.8-6.200 17.400-15 22-8.800-4.600-15-12.200-15-22V12z"
          fill="none"
          stroke="#c9a85c"
          strokeOpacity=".4"
          strokeWidth=".9"
        />
        <text
          x="24"
          y="32.5"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontSize="19"
          fontWeight="700"
          letterSpacing="1"
          fill="url(#crest-gold)"
        >
          {tr(SITE.initials)}
        </text>
        <path d="M17 38.5h14" stroke="#c9a85c" strokeWidth="1" strokeLinecap="round" strokeOpacity=".7" />
        <circle cx="24" cy="38.5" r="1.4" fill="#e8d29a" />
      </svg>
      <span className="logo-text">
        <small>{t.common.logoTag}</small>
        <strong>{tr('TOJIBOYEV ELDOR')}</strong>
      </span>
    </Link>
  )
}

export default function Header({ dark }) {
  const { t, lang, setLang, langs } = useLang()
  const [langOpen, setLangOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const wrap = useRef(null)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash, location.key])

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const close = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const solid = !dark || scrolled
  const compact = scrolled
  const cls = [
    'header',
    solid && !menuOpen ? 'solid' : '',
    !solid || menuOpen ? 'on-dark' : '',
    compact ? 'compact' : '',
    menuOpen ? 'menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const links = [
    ['/', t.nav.home],
    ['/xizmatlar', t.nav.services],
    ['/himoya-ishlari', t.nav.cases],
    ['/maqolalar', t.nav.articles],
    ['/haqida', t.nav.about],
  ]

  return (
    <header className={cls}>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-info">
            <a href={SITE.phones[0].href}>
              <Icon name="phone" size={14} />
              {SITE.phones[0].display}
            </a>
            <a href={`mailto:${SITE.email}`}>
              <Icon name="mail" size={14} />
              {SITE.email}
            </a>
            <span>
              <Icon name="clock" size={14} />
              {pick(SITE.hours, lang)}
            </span>
          </div>
          <div className="topbar-social">
            <a href={SITE.telegram} target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a href={SITE.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="header-inner">
        <Logo />

        <nav className="nav" aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-tools">
          <div className={langOpen ? 'lang-wrap open' : 'lang-wrap'} ref={wrap}>
            <button
              className="lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-label="Language"
            >
              <Flag lang={lang} width={22} />
              {langs.find((l) => l.id === lang)?.short}
            </button>
            <div className="lang-menu">
              {langs.map((l) => (
                <button
                  key={l.id}
                  className={l.id === lang ? 'active' : ''}
                  onClick={() => {
                    setLang(l.id)
                    setLangOpen(false)
                  }}
                >
                  <span className="lang-opt">
                    <Flag lang={l.id} width={24} />
                    {l.label}
                  </span>
                  {l.id === lang && <Icon name="check" size={14} stroke={2.4} />}
                </button>
              ))}
            </div>
          </div>
          <Link to={{ hash: 'aloqa' }} className="btn btn-gold btn-sm header-cta">
            {t.common.consult}
          </Link>
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.common.menu}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'}>
        <nav>
          {links.map(([to, label], i) => (
            <NavLink key={to} to={to} end={to === '/'} style={{ '--i': i }}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-langs">
          {langs.map((l) => (
            <button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => setLang(l.id)}>
              {l.short}
            </button>
          ))}
        </div>
        <div className="mobile-foot">
          <Link to={{ hash: 'aloqa' }} className="btn btn-gold">
            {t.common.consult}
            <Icon name="arrow" size={16} />
          </Link>
          <a className="btn btn-ghost mobile-phone" href={SITE.phones[0].href}>
            <Icon name="phone" size={16} />
            {SITE.phones[0].display}
          </a>
        </div>
      </div>
    </header>
  )
}

export function SearchPanel({ open, onClose }) {
  const { t } = useLang()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    const query = q.trim()
    onClose()
    navigate(query ? `/maqolalar?q=${encodeURIComponent(query)}` : '/maqolalar')
  }

  return (
    <div className="search-panel">
      <form className="wrap search-bar" onSubmit={submit}>
        <Icon name="search" size={20} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.common.searchPlaceholder}
          aria-label={t.common.search}
        />
        <button className="btn btn-navy btn-sm" type="submit">
          {t.common.search}
        </button>
      </form>
    </div>
  )
}
