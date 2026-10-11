import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import Icon from '../components/Icon'

export default function NotFound() {
  const { t } = useLang()
  return (
    <section className="sec sec-ivory notfound">
      <div className="wrap">
        <div className="nf-code">404</div>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.text}</p>
        <Link className="btn btn-navy btn-lg" to="/">
          <Icon name="arrowLeft" size={18} />
          {t.common.backHome}
        </Link>
      </div>
    </section>
  )
}
