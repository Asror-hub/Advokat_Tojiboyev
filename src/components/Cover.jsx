import { SITE } from '../data/site'

const TONES = {
  court: ['#16386a', '#060f1e'],
  books: ['#17445a', '#07131d'],
  scale: ['#2b2f66', '#0a0c20'],
  gavel: ['#4a3719', '#0c0905'],
  desk: ['#23406b', '#08101f'],
}

const ART = {
  court: (
    <>
      <path d="M170 200L400 92l230 108zM170 200h460" />
      <path d="M215 222v150M308 222v150M400 222v150M492 222v150M585 222v150" />
      <path d="M200 222h30M293 222h30M385 222h30M477 222h30M570 222h30" />
      <path d="M170 372h460M145 398h510M120 424h560" />
      <circle cx="400" cy="162" r="18" />
    </>
  ),
  scale: (
    <>
      <path d="M400 105v265M330 372h140M350 398h100" />
      <circle cx="400" cy="96" r="11" />
      <path d="M235 150h330" />
      <path d="M235 150l-62 128M235 150l62 128M565 150l-62 128M565 150l62 128" />
      <path d="M160 278q75 62 150 0zM490 278q75 62 150 0z" />
    </>
  ),
  books: (
    <>
      <rect x="215" y="340" width="340" height="44" rx="4" />
      <rect x="245" y="294" width="280" height="44" rx="4" />
      <rect x="230" y="248" width="310" height="44" rx="4" />
      <path d="M265 340v44M295 340v44M265 294v44M290 248v44M320 248v44" />
      <rect x="590" y="210" width="46" height="174" rx="4" />
      <path d="M590 250h46M590 344h46" />
      <path d="M350 130h120v76l-60-26-60 26z" />
    </>
  ),
  gavel: (
    <>
      <g transform="rotate(-32 400 240)">
        <rect x="285" y="170" width="230" height="86" rx="12" />
        <path d="M335 170v86M465 170v86" />
        <rect x="388" y="256" width="24" height="170" rx="10" />
      </g>
      <ellipse cx="400" cy="420" rx="170" ry="22" />
      <path d="M230 420v22q170 30 340 0v-22" />
    </>
  ),
  desk: (
    <>
      <rect x="250" y="84" width="300" height="340" rx="14" />
      <path d="M300 150h200M300 192h200M300 234h150M300 276h200M300 318h110" />
      <circle cx="470" cy="360" r="30" />
      <circle cx="470" cy="360" r="16" />
      <path d="M278 84V64h244v20" />
    </>
  ),
}

export function Cover({ src = '', className = '' }) {
  if (src && !src.startsWith('art:')) {
    return (
      <div className={`cover ${className}`}>
        <img src={src} alt="" loading="lazy" />
      </div>
    )
  }
  const key = src.replace('art:', '') in ART ? src.replace('art:', '') : 'court'
  const [a, b] = TONES[key] || TONES.court
  return (
    <div className={`cover ${className}`}>
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`cv-${key}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
          <radialGradient id={`cg-${key}`} cx=".78" cy=".15" r=".75">
            <stop offset="0" stopColor="#c9a85c" stopOpacity=".42" />
            <stop offset="1" stopColor="#c9a85c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill={`url(#cv-${key})`} />
        <rect width="800" height="500" fill={`url(#cg-${key})`} />
        <g stroke="rgba(255,255,255,.05)" strokeWidth="1">
          {Array.from({ length: 11 }, (_, i) => (
            <path key={`v${i}`} d={`M${i * 80} 0v500`} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${i * 80}h800`} />
          ))}
        </g>
        <g fill="none" stroke="#dcc283" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {ART[key]}
        </g>
      </svg>
    </div>
  )
}

export function Portrait({ photo, className = '' }) {
  return (
    <div className={`arch ${className}`}>
      {photo ? (
        <img src={photo} alt={SITE.name} />
      ) : (
        <svg viewBox="0 0 420 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d4378" />
              <stop offset="1" stopColor="#070f1e" />
            </linearGradient>
            <radialGradient id="pglow" cx=".5" cy=".3" r=".6">
              <stop offset="0" stopColor="#e8d29a" stopOpacity=".35" />
              <stop offset="1" stopColor="#e8d29a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="420" height="540" fill="url(#pg)" />
          <rect width="420" height="540" fill="url(#pglow)" />
          <g fill="none" stroke="#c9a85c" strokeOpacity=".45" strokeWidth="1.2">
            <circle cx="210" cy="210" r="82" />
            <circle cx="210" cy="210" r="126" />
            <circle cx="210" cy="210" r="172" />
          </g>
          <g fill="none" stroke="#e8d29a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M210 128v146M170 274h80" />
            <path d="M130 152h160M130 152l-34 70M130 152l34 70M290 152l-34 70M290 152l34 70" strokeWidth="2" />
            <path d="M92 222q38 34 76 0zM252 222q38 34 76 0z" strokeWidth="2" />
            <circle cx="210" cy="118" r="8" />
          </g>
          <g stroke="#c9a85c" strokeOpacity=".28" strokeWidth="1">
            <path d="M60 540V380M120 540V380M180 540V380M240 540V380M300 540V380M360 540V380" />
          </g>
          <text
            x="210"
            y="446"
            textAnchor="middle"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontSize="92"
            fontWeight="500"
            fill="#e8d29a"
            letterSpacing="6"
          >
            TE
          </text>
        </svg>
      )}
    </div>
  )
}
