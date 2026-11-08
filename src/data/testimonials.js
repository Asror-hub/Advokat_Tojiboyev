// Client testimonials shown in the home-page carousel.
//
// These are PLACEHOLDERS (square brackets) - replace them with real reviews that clients
// have agreed to publish. Add or remove items freely: the carousel adapts to the count.
// Write `uz` in Latin script; the Cyrillic Uzbek version is generated automatically.

const placeholder = {
  uz: '[Mijozning haqiqiy fikri shu yerda joylashtiriladi. Faqat chop etishga rozilik bergan mijozlarning sharhlari qo‘yiladi.]',
  ru: '[Здесь размещается настоящий отзыв клиента. Публикуются только отзывы клиентов, давших согласие на публикацию.]',
  en: '[A real client review goes here. Only reviews from clients who agreed to publication are published.]',
}

const name = { uz: '[Mijoz ismi]', ru: '[Имя клиента]', en: '[Client name]' }

export const TESTIMONIALS = [
  { id: 't1', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
  { id: 't2', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
  { id: 't3', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
  { id: 't4', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
  { id: 't5', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
  { id: 't6', name, role: { uz: '[Ish yo‘nalishi]', ru: '[Направление дела]', en: '[Practice area]' }, text: placeholder },
]
