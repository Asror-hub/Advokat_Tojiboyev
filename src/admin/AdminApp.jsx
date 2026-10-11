import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './admin.css'
import { useLang, formatDate } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { pick } from '../data/site'
import { Cover } from '../components/Cover'
import Icon from '../components/Icon'
import * as api from './api'
import Editor from './Editor'

function Login({ onDone }) {
  const { tr } = useLang()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.login(password)
      onDone()
    } catch (err) {
      setError(err.message === 'Wrong password' ? tr('Parol noto‘g‘ri') : err.message)
      setBusy(false)
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <span className="adm-login-icon">
          <Icon name="lock" size={26} stroke={1.5} />
        </span>
        <h1>{tr('Boshqaruv paneli')}</h1>
        <p>{tr('Maqolalar va himoya ishlarini boshqarish uchun parolni kiriting.')}</p>
        <label className="adm-field">
          <span className="adm-label">{tr('Parol')}</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="adm-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="adm-btn gold wide" disabled={busy || !password}>
          {busy ? tr('Tekshirilmoqda...') : tr('Kirish')}
        </button>
        <Link className="adm-link" to="/">
          <Icon name="arrowLeft" size={14} />
          {tr('Saytga qaytish')}
        </Link>
      </form>
    </div>
  )
}

function Dashboard({ onLogout }) {
  const { t, tr, lang, setLang } = useLang()
  const { articles, cases, refresh } = useContent()
  const [tab, setTab] = useState('articles')
  const [editing, setEditing] = useState(null) // { kind, item | null }
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(id)
  }, [toast])

  const isArticles = tab === 'articles'
  const items = isArticles ? articles : cases
  const basePath = isArticles ? '/maqolalar' : '/himoya-ishlari'

  const remove = async (item) => {
    if (!window.confirm(`${tr('O‘chirishni tasdiqlaysizmi?')}\n\n${pick(item.title, lang)}`)) return
    setError('')
    try {
      await api.deleteItem(tab, item.slug)
      await refresh()
      setToast(tr('O‘chirildi'))
    } catch (err) {
      if (err instanceof api.AuthError) onLogout()
      else setError(err.message)
    }
  }

  const closeEditor = (expired) => {
    setEditing(null)
    if (expired) onLogout()
  }

  const saved = async (_item, wasEdit) => {
    await refresh()
    setEditing(null)
    setToast(wasEdit ? tr('O‘zgarishlar saqlandi') : tr('E’lon qilindi'))
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-in">
          <Link className="adm-brand" to="/admin" onClick={() => setEditing(null)}>
            <span>{tr('Boshqaruv paneli')}</span>
          </Link>
          <div className="adm-top-actions">
            <div className="adm-langs" role="group" aria-label="Alphabet">
              <button type="button" className={lang === 'oz' ? 'on' : ''} onClick={() => setLang('oz')}>
                Кирилл
              </button>
              <button type="button" className={lang !== 'oz' ? 'on' : ''} onClick={() => setLang('uz')}>
                Lotin
              </button>
            </div>
            <Link className="adm-btn ghost sm" to="/" target="_blank">
              <Icon name="external" size={15} />
              {tr('Saytni ko‘rish')}
            </Link>
            <button type="button" className="adm-btn ghost sm" onClick={onLogout}>
              <Icon name="logout" size={15} />
              {tr('Chiqish')}
            </button>
          </div>
        </div>
      </header>

      <main className="adm-wrap">
        {editing ? (
          <Editor kind={editing.kind} item={editing.item} onCancel={closeEditor} onSaved={saved} />
        ) : (
          <>
            <div className="adm-bar">
              <div className="adm-tabs big" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isArticles}
                  className={isArticles ? 'on' : ''}
                  onClick={() => setTab('articles')}
                >
                  {tr('Maqolalar')} <b>{articles.length}</b>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isArticles}
                  className={!isArticles ? 'on' : ''}
                  onClick={() => setTab('cases')}
                >
                  {tr('Himoya ishlari')} <b>{cases.length}</b>
                </button>
              </div>
              <button type="button" className="adm-btn gold" onClick={() => setEditing({ kind: tab, item: null })}>
                <Icon name="plus" size={17} />
                {isArticles ? tr('Yangi maqola') : tr('Yangi himoya ishi')}
              </button>
            </div>

            {error && (
              <p className="adm-error" role="alert">
                {error}
              </p>
            )}

            {items.length === 0 && <p className="adm-empty">{tr('Hozircha hech narsa yo‘q.')}</p>}

            <ul className="adm-list">
              {items.map((item) => (
                <li className="adm-item" key={item.slug}>
                  <div className="adm-thumb">
                    <Cover src={item.image} />
                  </div>
                  <div className="adm-item-main">
                    <h3>{pick(item.title, lang)}</h3>
                    <div className="adm-meta">
                      <span>{formatDate(item.date, lang)}</span>
                      <i aria-hidden="true" />
                      <span>
                        {isArticles
                          ? t.articles.cats[item.category]
                          : t.common[item.status]}
                      </span>
                    </div>
                  </div>
                  <div className="adm-item-actions">
                    <Link className="adm-icon-btn" to={`${basePath}/${item.slug}`} target="_blank" title={tr('Ko‘rish')}>
                      <Icon name="external" size={17} />
                    </Link>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      title={tr('Tahrirlash')}
                      onClick={() => setEditing({ kind: tab, item })}
                    >
                      <Icon name="edit" size={17} />
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn danger"
                      title={tr('O‘chirish')}
                      onClick={() => remove(item)}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {toast && (
        <div className="adm-toast" role="status">
          <Icon name="check" size={16} stroke={2.4} />
          {toast}
        </div>
      )}
    </div>
  )
}

export default function AdminApp() {
  // null = checking the saved session, false = signed out, true = signed in
  const [authed, setAuthed] = useState(api.getToken() ? null : false)

  useEffect(() => {
    document.title = 'Admin'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  useEffect(() => {
    if (authed !== null) return
    api
      .checkSession()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
  }, [authed])

  const logout = () => {
    api.clearToken()
    setAuthed(false)
  }

  if (authed === null) return null
  return authed ? <Dashboard onLogout={logout} /> : <Login onDone={() => setAuthed(true)} />
}
