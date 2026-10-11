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
    ['/aloqa', t.nav.contact],
  ]

  return (
    <footer className="footer">
      <div className="footer-mark" aria-hidden="true">
        {tr('TOJIBOYEV ELDOR')}
      </div>
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p className="footer-tag">{t.footer.tagline}</p>
          <div className="socials">
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
        <div>
          <h4>{t.footer.sections}</h4>
          <ul>
            {nav.map(([to, label]) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>{t.footer.contact}</h4>
          <ul className="footer-contact">
            <li>
              <Icon name="phone" size={16} />
              <span>
                {SITE.phones.map((p) => (
                  <a key={p.href} href={p.href}>
                    {p.display}
                  </a>
                ))}
              </span>
            </li>
            <li>
              <Icon name="mail" size={16} />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <Icon name="pin" size={16} />
              <span>{pick(SITE.address, lang)}</span>
            </li>
            <li>
              <Icon name="clock" size={16} />
              <span>{pick(SITE.hours, lang)}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-legal">
        <p>{t.footer.disclaimer}</p>
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
