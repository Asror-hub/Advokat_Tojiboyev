import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SITE } from '../data/site'
import { useLang } from '../context/LanguageContext'
import Icon from './Icon'
import Flag from './Flag'
import logoImg from '../assets/logo.jpg'

export function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'light' : ''}`} aria-label={SITE.practice}>
      <img className="logo-img" src={logoImg} alt="" width="906" height="954" />
      <span className="logo-text">
        <strong>TEN Duayen</strong>
        <small>by Tojiboev’s</small>
      </span>
    </Link>
  )
}

function NavItem({ to, label, index, mobile = false }) {
  const inner = mobile ? (
    <>
      <span>{String(index + 1).padStart(2, '0')}</span>
      {label}
    </>
  ) : (
    label
  )
  if (to.startsWith('#')) {
    return (
      <Link to={{ pathname: '/', hash: to.slice(1) }} style={mobile ? { '--i': index } : undefined}>
        {inner}
      </Link>
    )
  }
  return (
    <NavLink to={to} end={to === '/'} style={mobile ? { '--i': index } : undefined}>
      {inner}
    </NavLink>
  )
}

export default function Header({ dark, light = false }) {
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
  const onLight = light && !scrolled && !menuOpen
  const cls = [
    'header',
    solid && !menuOpen ? 'solid' : '',
    (!solid || menuOpen) && !onLight ? 'on-dark' : '',
    onLight ? 'on-light' : '',
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
      <div className="header-inner">
        <Logo />

        <nav className="nav" aria-label="Main">
          {links.map(([to, label], i) => (
            <NavItem key={to} to={to} label={label} index={i} />
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
              <Icon name="chevronDown" size={14} stroke={2} />
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
            <NavItem key={to} to={to} label={label} index={i} mobile />
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
