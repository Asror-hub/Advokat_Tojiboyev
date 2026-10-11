import { Link } from 'react-router-dom'
import { SITE, pick } from '../data/site'
import { useLang } from '../context/LanguageContext'
import { Logo } from './Header'
import Icon from './Icon'

export default function Footer() {
  const { t, lang, tr } = useLang()
  const nav = [
    ['/', t.nav.home],
    ['/xizmatlar', t.nav.services],
    ['/himoya-ishlari', t.nav.cases],
    ['/maqolalar', t.nav.articles],
    ['/haqida', t.nav.about],
    ['#aloqa', t.nav.contact],
  ]

  const socials = [
    ['Telegram', SITE.telegram],
    ['Facebook', SITE.facebook],
    ['Instagram', SITE.instagram],
  ]

  return (
    <footer className="footer">
      <div className="footer-mark" aria-hidden="true">
        {tr('TOJIBOYEV ELDOR')}
      </div>
      <div className="footer-rule" aria-hidden="true">
        <span />
      </div>

      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p className="footer-tag">{t.footer.tagline}</p>
          <div className="socials">
            {socials.map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noreferrer">
                {name}
                <Icon name="arrowUpRight" size={14} stroke={2} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>{t.footer.sections}</h4>
          <ul className="footer-nav">
            {nav.map(([to, label]) => (
              <li key={to}>
                <Link to={to.startsWith('#') ? { hash: to.slice(1) } : to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.footer.contact}</h4>
          <ul className="footer-contact">
            <li>
              <span className="fi">
                <Icon name="phone" size={16} />
              </span>
              <div>
                <small>{t.common.phone}</small>
                {SITE.phones.map((p) => (
                  <a key={p.href} href={p.href}>
                    {p.display}
                  </a>
                ))}
              </div>
            </li>
            <li>
              <span className="fi">
                <Icon name="mail" size={16} />
              </span>
              <div>
                <small>{t.common.email}</small>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </div>
            </li>
            <li>
              <span className="fi">
                <Icon name="pin" size={16} />
              </span>
              <div>
                <small>{t.common.address}</small>
                <a href={SITE.maps} target="_blank" rel="noreferrer">
                  {pick(SITE.address, lang)}
                </a>
              </div>
            </li>
            <li>
              <span className="fi">
                <Icon name="clock" size={16} />
              </span>
              <div>
                <small>{t.common.workingHours}</small>
                <span>{pick(SITE.hours, lang)}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap">
        <p className="footer-legal">{t.footer.disclaimer}</p>
      </div>
      <div className="wrap footer-bottom">
        <span>{t.footer.copy}</span>
        <span className="footer-links">
          <Link to="/maxfiylik">{t.common.privacy}</Link>
          <Link to="/foydalanish-shartlari">{t.common.terms}</Link>
          <span>{t.common.city}</span>
        </span>
      </div>
    </footer>
  )
}
