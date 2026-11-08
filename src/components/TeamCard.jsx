import { Reveal } from './Reveal'

// Team photos: drop portraits into src/assets/team/ named by position, 01.jpg, 02.jpg ...
// (jpg, jpeg, png or webp). A member without a photo shows a gold silhouette placeholder.
const photoFiles = import.meta.glob('../assets/team/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const photos = Object.fromEntries(
  Object.entries(photoFiles).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), src]),
)

export default function TeamCard({ member, index, areaLabel, detailed = false, delay = 0, reveal = true }) {
  const num = String(index + 1).padStart(2, '0')
  const photo = photos[num]
  const Wrapper = reveal ? Reveal : 'article'
  const wrapperProps = reveal ? { as: 'article', delay } : {}

  return (
    <Wrapper {...wrapperProps} className={detailed ? 'tc-card is-detailed' : 'tc-card'}>
      <div className="tc-portrait">
        {photo ? (
          <img src={photo} alt={member.role} loading="lazy" />
        ) : (
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="86" fill="none" stroke="#c9a85c" strokeOpacity=".28" />
            <circle cx="100" cy="100" r="64" fill="none" stroke="#c9a85c" strokeOpacity=".16" />
            <g fill="none" stroke="#e1c27a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="100" cy="80" r="26" />
              <path d="M52 156c4-30 26-46 48-46s44 16 48 46" />
            </g>
          </svg>
        )}
        <span className="tc-num">{num}</span>
      </div>
      <div className="tc-body">
        <h3>{member.role}</h3>
        <p className="tc-name">{member.name}</p>
        {detailed && (
          <p className="tc-area">
            <b>{areaLabel}</b>
            {member.area}
          </p>
        )}
      </div>
    </Wrapper>
  )
}
