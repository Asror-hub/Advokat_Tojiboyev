import { useState } from 'react'
import { SITE, pick } from '../data/site'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import Icon from '../components/Icon'

export default function Contact() {
  const { t, lang } = useLang()
  const tgUser = '@' + SITE.telegram.replace(/\/+$/, '').split('/').pop()
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = t.common.required
    if (!form.phone.trim()) next.phone = t.common.required
    if (!form.message.trim()) next.message = t.common.required
    setErrors(next)
    if (Object.keys(next).length) return
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      setForm({ name: '', phone: '', message: '' })
    }, 800)
  }

  return (
    <>
      <PageHero kicker={t.contact.kicker} title={t.contact.title} lead={t.contact.lead}>
        <p className="reply-note">
          <Icon name="clock" size={16} />
          {t.contact.reply}
        </p>
      </PageHero>

      <section className="sec sec-ivory">
        <div className="wrap contact-grid">
          <Reveal className="info-card">
            <div className="kicker kicker-line">{t.contact.details}</div>
            <ul>
              <li>
                <span className="ii">
                  <Icon name="phone" size={20} />
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
                <span className="ii">
                  <Icon name="telegram" size={20} />
                </span>
                <div>
                  <small>Telegram</small>
                  <a href={SITE.telegram} target="_blank" rel="noreferrer">
                    {tgUser}
                  </a>
                </div>
              </li>
              <li>
                <span className="ii">
                  <Icon name="mail" size={20} />
                </span>
                <div>
                  <small>{t.common.email}</small>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </li>
              <li>
                <span className="ii">
                  <Icon name="pin" size={20} />
                </span>
                <div>
                  <small>{t.common.address}</small>
                  <a href={SITE.maps} target="_blank" rel="noreferrer">
                    {pick(SITE.address, lang)}
                  </a>
                </div>
              </li>
              <li>
                <span className="ii">
                  <Icon name="clock" size={20} />
                </span>
                <div>
                  <small>{t.common.workingHours}</small>
                  <span>{pick(SITE.hours, lang)}</span>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <form className="form-card" onSubmit={submit} noValidate>
              {status === 'sent' && (
                <div className="success-note" role="status">
                  <Icon name="check" size={18} stroke={2.4} />
                  {t.common.sent}
                </div>
              )}
              <div className="form-row">
                <label className={errors.name ? 'has-error' : ''}>
                  <span>{t.contact.name} *</span>
                  <input name="name" value={form.name} onChange={onChange} placeholder={t.contact.namePh} autoComplete="name" />
                  {errors.name && <em className="form-error">{errors.name}</em>}
                </label>
                <label className={errors.phone ? 'has-error' : ''}>
                  <span>{t.contact.phone} *</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder={t.contact.phonePh}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {errors.phone && <em className="form-error">{errors.phone}</em>}
                </label>
              </div>
              <label className={errors.message ? 'has-error' : ''}>
                <span>{t.contact.message} *</span>
                <textarea name="message" value={form.message} onChange={onChange} placeholder={t.contact.messagePh} rows={6} />
                {errors.message && <em className="form-error">{errors.message}</em>}
              </label>
              <button className="btn btn-navy btn-lg" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? t.common.sending : t.common.send}
                <Icon name="send" size={18} />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}
