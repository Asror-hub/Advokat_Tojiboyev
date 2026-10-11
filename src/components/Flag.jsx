// Small inline SVG flags (emoji flags do not render on Windows).
// Both Uzbek variants (Latin and Cyrillic) use the flag of Uzbekistan.

function Uzbekistan() {
  return (
    <>
      <rect width="30" height="6.5" fill="#0099b5" />
      <rect y="6.5" width="30" height="0.6" fill="#ce1126" />
      <rect y="7.1" width="30" height="5.8" fill="#fff" />
      <rect y="12.9" width="30" height="0.6" fill="#ce1126" />
      <rect y="13.5" width="30" height="6.5" fill="#1eb53a" />
      <circle cx="5.4" cy="3.3" r="2.1" fill="#fff" />
      <circle cx="6.2" cy="3.3" r="1.8" fill="#0099b5" />
      <g fill="#fff">
        <circle cx="9.2" cy="1.5" r=".45" />
        <circle cx="11.2" cy="1.5" r=".45" />
        <circle cx="13.2" cy="1.5" r=".45" />
        <circle cx="10.2" cy="3.3" r=".45" />
        <circle cx="12.2" cy="3.3" r=".45" />
        <circle cx="11.2" cy="5.1" r=".45" />
      </g>
    </>
  )
}

function Russia() {
  return (
    <>
      <rect width="30" height="6.67" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
      <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
    </>
  )
}

function UnitedKingdom() {
  return (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6.4" />
      <path d="M15 0V20M0 10H30" stroke="#c8102e" strokeWidth="3.8" />
    </>
  )
}

const FLAGS = { oz: Uzbekistan, uz: Uzbekistan, ru: Russia, en: UnitedKingdom }

export default function Flag({ lang, width = 24 }) {
  const Art = FLAGS[lang] || Uzbekistan
  const id = `flag-clip-${lang}`
  return (
    <svg
      className="flag"
      width={width}
      height={(width * 2) / 3}
      viewBox="0 0 30 20"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <rect width="30" height="20" rx="3" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Art />
      </g>
      <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth=".8" />
    </svg>
  )
}
