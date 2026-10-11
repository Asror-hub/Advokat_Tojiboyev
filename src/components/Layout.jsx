import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ContactSection from './ContactSection'
import Icon from './Icon'
import { SITE } from '../data/site'
import { useLang } from '../context/LanguageContext'

const DARK_HERO = [
  '/',
  '/maqolalar',
  '/himoya-ishlari',
  '/haqida',
  '/xizmatlar',
  '/maxfiylik',
  '/foydalanish-shartlari',
]

export default function Layout() {
  const { t } = useLang()
  const location = useLocation()
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  const path = location.pathname.replace(/\/$/, '') || '/'
  const dark = DARK_HERO.includes(path)

  // New page -> top. A link to #aloqa -> scroll to the contact block above the footer.
  useEffect(() => {
    setWidgetOpen(false)
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1))
      // wait a tick so the new page has rendered and its height is known
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash, location.key])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        {t.common.skip}
      </a>
      <Header dark={dark} />
      <main id="main" className={dark ? '' : 'pad-top'}>
        <Outlet />
      </main>
      <ContactSection />
      <Footer />

      <div className={widgetOpen ? 'widget open' : 'widget'}>
        <div className="widget-panel">
          <div className="widget-head">
            <span className="dot" />
            <div>
              <strong>{t.widget.hello}</strong>
              <p>{t.widget.text}</p>
            </div>
          </div>
          <a href={SITE.phones[0].href}>
            <span className="wi">
              <Icon name="phone" size={18} />
            </span>
            <span className="wt">
              {t.widget.call}
              <small>{t.widget.callHint}</small>
            </span>
            <Icon name="arrow" size={16} />
          </a>
          <Link to={{ hash: 'aloqa' }} onClick={() => setWidgetOpen(false)}>
            <span className="wi">
              <Icon name="send" size={18} />
            </span>
            <span className="wt">
              {t.widget.form}
              <small>{t.widget.formHint}</small>
            </span>
            <Icon name="arrow" size={16} />
          </Link>
          <a href={SITE.telegram} target="_blank" rel="noreferrer">
            <span className="wi">
              <Icon name="telegram" size={18} />
            </span>
            <span className="wt">
              {t.widget.tg}
              <small>{t.widget.tgHint}</small>
            </span>
            <Icon name="arrow" size={16} />
          </a>
        </div>
        <button
          className="widget-toggle"
          onClick={() => setWidgetOpen((v) => !v)}
          aria-label={t.common.consult}
          aria-expanded={widgetOpen}
        >
          <span className="wt-icon" key={widgetOpen ? 'close' : 'scale'}>
            <Icon name={widgetOpen ? 'close' : 'scale'} size={24} stroke={1.5} />
          </span>
        </button>
      </div>

      <button
        className={showTop ? 'to-top show' : 'to-top'}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t.common.backToTop}
      >
        <Icon name="arrowUp" size={18} />
      </button>
    </>
  )
}
