import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import TeamCard from '../components/TeamCard'

export default function Team() {
  const { t } = useLang()
  const tm = t.team

  return (
    <>
      <PageHero kicker={tm.kicker} title={tm.title}>
        <p className="page-lead">
          <strong className="lead-brand">{tm.heading}.</strong> {tm.lead}
        </p>
      </PageHero>

      <section className="sec sec-ivory">
        <div className="wrap">
          <div className="tc-grid is-page">
            {tm.members.map((m, i) => (
              <TeamCard key={m.role} member={m} index={i} areaLabel={tm.areaLabel} detailed delay={(i % 4) * 80} />
            ))}
          </div>
          <p className="services-note">{tm.note}</p>
        </div>
      </section>
    </>
  )
}
