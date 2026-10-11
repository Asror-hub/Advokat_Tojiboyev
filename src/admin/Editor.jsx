import { useRef, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { toCyrillic } from '../i18n/translit'
import { Cover } from '../components/Cover'
import Icon from '../components/Icon'
import * as api from './api'
import RichEditor from './RichEditor'
import { ART_COVERS, ARTICLE_CATS, LANG_TABS, check, emptyForm, fromForm, toForm } from './model'

function Field({ label, hint, required, children }) {
  return (
    <label className="adm-field">
      <span className="adm-label">
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {hint && <small className="adm-hint">{hint}</small>}
    </label>
  )
}

export default function Editor({ kind, item, onCancel, onSaved }) {
  const { t, tr } = useLang()
  const isArticle = kind === 'articles'
  const [form, setForm] = useState(() => (item ? toForm(kind, item) : emptyForm(kind)))
  const [tab, setTab] = useState('uz')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bodyBusy, setBodyBusy] = useState(false)
  const fileRef = useRef(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setTri = (key, value) => setForm((f) => ({ ...f, [key]: { ...f[key], [tab]: value } }))
  const setBody = (lang, html) => setForm((f) => ({ ...f, body: { ...f.body, [lang]: html } }))
  const isUpload = form.image && !form.image.startsWith('art:')
  const req = tab === 'uz'

  const setRow = (i, patch) =>
    setForm((f) => ({ ...f, timeline: f.timeline.map((r, k) => (k === i ? { ...r, ...patch } : r)) }))
  const addRow = () => setForm((f) => ({ ...f, timeline: [...f.timeline, { date: '', uz: '', ru: '', en: '' }] }))
  const delRow = (i) => setForm((f) => ({ ...f, timeline: f.timeline.filter((_, k) => k !== i) }))

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const dataUrl = await api.prepareImage(file)
      const { url } = await api.uploadImage(dataUrl)
      set('image', url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const problem = check(kind, form)
    if (problem) {
      setTab('uz')
      setError(problem)
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = fromForm(kind, form)
      const saved = item ? await api.updateItem(kind, item.slug, data) : await api.createItem(kind, data)
      await onSaved(saved, Boolean(item))
    } catch (err) {
      setError(err.message)
      setBusy(false)
      if (err instanceof api.AuthError) onCancel(true)
    }
  }

  const heading = item
    ? isArticle
      ? tr('Maqolani tahrirlash')
      : tr('Himoya ishini tahrirlash')
    : isArticle
      ? tr('Yangi maqola')
      : tr('Yangi himoya ishi')

  return (
    <form className="adm-editor" onSubmit={submit}>
      <div className="adm-editor-head">
        <button type="button" className="adm-back" onClick={() => onCancel(false)}>
          <Icon name="arrowLeft" size={16} />
          {tr('Ro‘yxatga qaytish')}
        </button>
        <h2>{heading}</h2>
      </div>

      <div className="adm-editor-grid">
        <div className="adm-card adm-main">
          <div className="adm-tabs" role="tablist">
            {LANG_TABS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={tab === l.id}
                className={tab === l.id ? 'on' : ''}
                onClick={() => setTab(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="adm-note">
            {tab === 'uz'
              ? tr('Asosiy til. Kirill varianti shu matndan avtomatik yaratiladi.')
              : tr('Ixtiyoriy. Bo‘sh qoldirilsa, saytda o‘zbekcha matn ko‘rsatiladi.')}
          </p>

          <Field label={tr('Sarlavha')} required={req}>
            <input
              type="text"
              value={form.title[tab]}
              maxLength={240}
              onChange={(e) => setTri('title', e.target.value)}
            />
            {tab === 'uz' && form.title.uz && <small className="adm-cyr">{toCyrillic(form.title.uz)}</small>}
          </Field>

          <Field label={tr('Qisqa tavsif')} required={req} hint={tr('Kartochkada va sarlavha ostida ko‘rinadi.')}>
            <textarea
              rows={3}
              value={form.excerpt[tab]}
              maxLength={600}
              onChange={(e) => setTri('excerpt', e.target.value)}
            />
          </Field>

          {!isArticle && (
            <div className="adm-row">
              <Field label={tr('Ish turi')} required={req}>
                <input
                  type="text"
                  value={form.category[tab]}
                  maxLength={100}
                  placeholder={tr('Masalan: Jinoyat ishi')}
                  onChange={(e) => setTri('category', e.target.value)}
                />
              </Field>
              <Field label={tr('Sud')} required={req}>
                <input
                  type="text"
                  value={form.court[tab]}
                  maxLength={200}
                  placeholder={tr('Masalan: Oliy sud')}
                  onChange={(e) => setTri('court', e.target.value)}
                />
              </Field>
              <Field label={tr('Natija (ixtiyoriy)')} hint={tr('Masalan: 80% yoki 18,6 mlrd so‘m')}>
                <input
                  type="text"
                  value={form.amount[tab]}
                  maxLength={60}
                  onChange={(e) => setTri('amount', e.target.value)}
                />
              </Field>
            </div>
          )}

          <div className="adm-field">
            <span className="adm-label">
              {tr('Matn')}
              {req && <b aria-hidden="true"> *</b>}
            </span>
            <RichEditor
              key={tab}
              value={form.body[tab]}
              onChange={(html) => setBody(tab, html)}
              onBusy={setBodyBusy}
              onError={setError}
            />
            <small className="adm-hint">
              {tr('Rasm qo‘shish: tugma, skrinshotni Ctrl+V yoki faylni sudrab olib kelish. Rasmni bosib tanlang: burchakdagi nuqtani tortib o‘lchamini o‘zgartiring, rasmni ushlab matn ichida istalgan joyga ko‘chiring.')}
            </small>
          </div>

          {isArticle && (
            <Field label={tr('Teglar')} hint={tr('Vergul bilan ajrating: qasd, tintuv, sud nazorati')}>
              <input type="text" value={form.tags[tab]} onChange={(e) => setTri('tags', e.target.value)} />
            </Field>
          )}

          {!isArticle && (
            <div className="adm-timeline">
              <div className="adm-label">{tr('Ish bosqichlari (xronologiya)')}</div>
              {form.timeline.map((row, i) => (
                <div className="adm-trow" key={i}>
                  <input
                    type="text"
                    aria-label={tr('Sana')}
                    value={row.date}
                    maxLength={24}
                    placeholder="2026-09"
                    onChange={(e) => setRow(i, { date: e.target.value })}
                  />
                  <input
                    type="text"
                    aria-label={tr('Bosqich')}
                    value={row[tab]}
                    maxLength={160}
                    placeholder={tr('Masalan: Protest rad etildi')}
                    onChange={(e) => setRow(i, { [tab]: e.target.value })}
                  />
                  <button type="button" className="adm-icon-btn danger" onClick={() => delRow(i)} aria-label="×">
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="adm-btn ghost sm" onClick={addRow}>
                <Icon name="plus" size={16} />
                {tr('Bosqich qo‘shish')}
              </button>
            </div>
          )}
        </div>

        <aside className="adm-side">
          <div className="adm-card">
            <Field label={tr('Sana')} required>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            {isArticle ? (
              <Field label={tr('Bo‘lim')}>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {ARTICLE_CATS.map((c) => (
                    <option key={c} value={c}>
                      {t.articles.cats[c]}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label={tr('Holat')}>
                <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="successful">{t.common.successful}</option>
                  <option value="notable">{t.common.notable}</option>
                </select>
              </Field>
            )}
          </div>

          <div className="adm-card">
            <div className="adm-label">{tr('Muqova')}</div>
            <div className="adm-cover-preview">
              <Cover src={form.image} />
            </div>
            <div className="adm-covers">
              {ART_COVERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={form.image === `art:${c}` ? 'on' : ''}
                  onClick={() => set('image', `art:${c}`)}
                  aria-label={c}
                >
                  <Cover src={`art:${c}`} />
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickFile} />
            <button
              type="button"
              className="adm-btn ghost wide"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Icon name="upload" size={16} />
              {uploading ? tr('Yuklanmoqda...') : isUpload ? tr('Rasmni almashtirish') : tr('O‘z rasmingizni yuklash')}
            </button>
            <small className="adm-hint">{tr('JPG, PNG yoki WebP. Rasm avtomatik kichraytiriladi.')}</small>
          </div>

          <div className="adm-card adm-actions">
            {error && (
              <p className="adm-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="adm-btn gold wide" disabled={busy || uploading || bodyBusy}>
              {busy ? tr('Saqlanmoqda...') : item ? tr('O‘zgarishlarni saqlash') : tr('E’lon qilish')}
            </button>
            <button type="button" className="adm-btn ghost wide" onClick={() => onCancel(false)}>
              {tr('Bekor qilish')}
            </button>
          </div>
        </aside>
      </div>
    </form>
  )
}
