import heroPhoto from '../assets/hero.jpeg'
import { deepCyrillic } from '../i18n/translit'

export const SITE = {
  name: 'Tojiboyev Eldor',
  fullName: 'Tojiboyev Eldor',
  brand: 'ADVOKAT TOJIBOYEV ELDOR',
  initials: 'TE',
  domain: 'advokat-eldor.uz',
  email: 'info@advokat-eldor.uz',
  // Portrait used in the hero and About page. Replace src/assets/hero.jpeg to change it.
  photo: heroPhoto,
  phones: [
    { display: '+998 90 123 45 67', href: 'tel:+998901234567' },
    { display: '+998 91 123 45 67', href: 'tel:+998911234567' },
  ],
  address: {
    uz: 'Toshkent shahri, Yakkasaroy tumani, Muqimiy ko‘chasi 1B, 3-qavat',
    ru: 'г. Ташкент, Яккасарайский район, ул. Мукимий 1Б, 3 этаж',
    en: '1B Muqumiy Street, 3rd floor, Yakkasaray District, Tashkent',
  },
  maps: 'https://maps.google.com/',
  telegram: 'https://t.me/advokat_eldor',
  facebook: 'https://facebook.com/',
  instagram: 'https://instagram.com/',
  hours: {
    uz: 'Du – Ju: 09:00 – 18:00',
    ru: 'Пн – Пт: 09:00 – 18:00',
    en: 'Mon – Fri: 09:00 – 18:00',
  },
  stats: [
    { value: '12+', key: 'years' },
    { value: '400+', key: 'cases' },
    // Placeholder - replace with the real success rate.
    { value: '92%', key: 'success' },
  ],
}

// Picks the text for the active language. Uzbek (Cyrillic, "oz") is derived
// from the Uzbek (Latin) text unless an explicit `oz` value exists.
export const pick = (value, lang) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (lang === 'oz') {
    if (value.oz != null) return value.oz
    if (value.uz != null) return deepCyrillic(value.uz)
  }
  return value[lang] || value.uz || value.en || ''
}
