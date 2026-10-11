import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'

function LegalPage({ data }) {
  return (
    <>
      <PageHero title={data.title} lead={data.updated} />
      <section className="sec sec-ivory">
        <div className="wrap narrow">
          <div className="legal">
            {data.sections.map((s) => (
              <div key={s.t}>
                <h2>{s.t}</h2>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function Privacy() {
  const { t } = useLang()
  return <LegalPage data={t.privacy} />
}

export function Terms() {
  const { t } = useLang()
  return <LegalPage data={t.terms} />
}
