import { useContent } from '../context/ContentContext'
import { useLang } from '../context/LanguageContext'
import PageHero from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { CaseCard } from '../components/Cards'

export default function Cases() {
  const { t } = useLang()
  const { cases } = useContent()
  const [first, ...others] = cases

  return (
    <>
      <PageHero kicker={t.cases.kicker} title={t.cases.title} lead={t.cases.lead} />
      <section className="sec sec-ivory">
        <div className="wrap">
          {first && (
            <Reveal>
              <CaseCard c={first} feature />
            </Reveal>
          )}
          <div className="grid-2">
            {others.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 2) * 100}>
                <CaseCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
