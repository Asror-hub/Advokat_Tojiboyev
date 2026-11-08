import { useLang } from '../context/LanguageContext'
import { pick } from '../data/site'
import { TESTIMONIALS } from '../data/testimonials'
import { Reveal } from './Reveal'
import Icon from './Icon'

// Two rows of review cards that drift in opposite directions. Each row renders its list twice
// so the loop is seamless; hovering (or focusing) a row pauses it. With reduced motion the
// rows stay still and can be scrolled by hand.
function Row({ items, reverse = false, lang }) {
  // One half of the track must be wider than the screen, so repeat the list first.
  const base = Array.from({ length: Math.max(1, Math.ceil(8 / items.length)) }).flatMap(() => items)
  const loop = [...base, ...base]
  return (
    <div className={reverse ? 'tm-row is-reverse' : 'tm-row'}>
      <ul className="tm-track">
        {loop.map((item, i) => {
          const name = pick(item.name, lang)
          return (
            <li key={`${item.id}-${i}`} className="tm-card" aria-hidden={i >= items.length ? 'true' : undefined}>
              <Icon name="quote" size={30} stroke={1.3} />
              <p>{pick(item.text, lang)}</p>
              <div className="tm-author">
                <span className="tm-avatar" aria-hidden="true">
                  {name.replace(/[^\p{L}]/gu, '').charAt(0) || '·'}
                </span>
                <span>
                  <b>{name}</b>
                  <small>{pick(item.role, lang)}</small>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Testimonials() {
  const { t, lang } = useLang()
  const words = t.home.testiTitle.split(' ')
  const half = Math.ceil(TESTIMONIALS.length / 2)
  const rowA = TESTIMONIALS.slice(0, half)
  const rowB = TESTIMONIALS.slice(half)

  return (
    <section className="sec sec-ivory tm-sec" id="fikrlar">
      <div className="wrap">
        <Reveal className="center-head services-head">
          <h2>
            {words.length > 1 ? words.slice(0, -1).join(' ') + ' ' : ''}
            <em>{words[words.length - 1]}</em>
          </h2>
          <span className="orn" aria-hidden="true" />
          <p className="center-lead">{t.home.testiLead}</p>
        </Reveal>
      </div>

      <Reveal className="tm-rows">
        <Row items={rowA} lang={lang} />
        <Row items={rowB.length ? rowB : rowA} reverse lang={lang} />
      </Reveal>

      <div className="wrap">
        <p className="certs-note">{t.home.testiNote}</p>
      </div>
    </section>
  )
}
