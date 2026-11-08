import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { Reveal } from './Reveal'
import { SITE } from '../data/site'

// Set to true to show the breadcrumb path above the hero title again.
const SHOW_CRUMBS = false

export default function PageHero({ title, lead, kicker, crumb, back, children, light = false, image }) {
  const { t } = useLang()
  const words = String(title).split(' ')
  const last = words.length > 1 ? words[words.length - 1] : null
  return (
    <section className={light ? 'page-hero page-hero-light' : 'page-hero'}>
      {light ? (
        <div className="phl-bg" aria-hidden="true">
          <img src={image || SITE.photo} alt="" fetchPriority="high" />
        </div>
      ) : (
        <div className="page-hero-glow" aria-hidden="true" />
      )}
      <div className="wrap">
        <Reveal>
          {kicker && <p className="page-kicker">{kicker}</p>}
          {SHOW_CRUMBS && (
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">{t.nav.home}</Link>
              {back && (
                <>
                  <i className="sep" aria-hidden="true" />
                  <Link to={back.to}>{back.label}</Link>
                </>
              )}
              <i className="sep" aria-hidden="true" />
              <span aria-current="page">{crumb || title}</span>
            </nav>
          )}
          <h1>
            {last ? (
              <>
                {words.slice(0, -1).join(' ')} <em>{last}</em>
              </>
            ) : (
              title
            )}
          </h1>
          <span className="orn" aria-hidden="true" />
          {lead && <p className="page-lead">{lead}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
