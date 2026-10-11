export const ARTICLE_CATEGORIES = ['all', 'analysis', 'qa', 'legislation', 'news']

export const ARTICLES = [
  {
    slug: 'gharazli-maksad-va-talontoroj',
    category: 'analysis',
    date: '2026-10-06',
    title: {
      uz: 'Moliyaviy zarardan rasstratagacha: to‘g‘ri qasd va g‘arazli maqsad',
      ru: 'От финансового ущерба до растраты: прямой умысел и корыстная цель',
      en: 'From financial loss to embezzlement: direct intent and selfish purpose',
    },
    excerpt: {
      uz: 'G‘arazli maqsadsiz talon-taroj bo‘lishi mumkin emas. Zarar borligi — jinoyat tarkibi emas.',
      ru: 'Без корыстной цели хищения быть не может. Наличие ущерба — ещё не состав преступления.',
      en: 'There is no embezzlement without a selfish purpose. Loss alone is not an offence.',
    },
    image: 'art:books',
    tags: {
      uz: ['qasd', 'g‘araz', 'iqtisodiy jinoyat'],
      ru: ['умысел', 'корысть', 'экономическое преступление'],
      en: ['intent', 'motive', 'economic crime'],
    },
    body: {
      uz: [
        'Moliyaviy zarar aniqlangani bilan ish yopilmaydi. Jinoyat tarkibi qasd, oqibat va subyektiv tomonni talab qiladi.',
        'Rasstrata va talon-tarojda g‘arazli maqsad — tarkibning ajralmas qismi. Uni taxmin qilish mumkin emas, isbotlash kerak.',
        'Agar shaxsda o‘zlashtirish niyati bo‘lmasa, xato, tartibsizlik yoki zarar o‘zi jinoyatga aylanmaydi. Bu farqni yo‘qotish odamni «qulay» aybdorga aylantiradi.',
        'Himoya shu nuqtadan boshlanadi: zarar bor-yu, g‘araz yo‘qmi? Qonun bu savolga javob talab qiladi.',
      ],
      ru: [
        'Выявленный финансовый ущерб сам по себе дело не закрывает. Состав требует умысла, последствия и субъективной стороны.',
        'При растрате корыстная цель — неотъемлемый элемент. Её нельзя предполагать, её нужно доказать.',
        'Если намерения присвоить не было, ошибка, беспорядок или ущерб сами по себе преступлением не становятся.',
        'Защита начинается с вопроса: ущерб есть, а корысти нет? Закон требует ответа.',
      ],
      en: [
        'A proven financial loss does not close a criminal case. An offence needs intent, consequence and a mental element.',
        'In embezzlement, a selfish purpose is an element, not a decoration. It must be proved, not presumed.',
        'Without an intent to appropriate, error, disorder or loss do not become a crime. Collapsing that distinction makes a convenient defendant.',
        'Defense starts here: there is loss — is there greed? The law requires an answer.',
      ],
    },
  },
  {
    slug: 'avval-tintuv-keyin-sudmi',
    category: 'analysis',
    date: '2026-09-18',
    title: {
      uz: 'Avval tintuv, keyin sudmi? Masala Konstitutsiyaviy sudgacha yetdi',
      ru: 'Сначала обыск, потом суд? Вопрос дошёл до Конституционного суда',
      en: 'Search first, court later? The issue reached the Constitutional Court',
    },
    excerpt: {
      uz: 'Agar sud qarori tintuvning asosi bo‘lsa, u tintuvdan oldin mavjud bo‘lishi kerak.',
      ru: 'Если судебное решение — основание обыска, оно должно существовать до обыска.',
      en: 'If a court order is the basis for a search, it must exist before the search.',
    },
    image: 'art:court',
    tags: {
      uz: ['tintuv', 'sud nazorati', 'konstitutsiya'],
      ru: ['обыск', 'судебный контроль', 'конституция'],
      en: ['search', 'judicial warrant', 'constitution'],
    },
    body: {
      uz: [
        'Uyga kirish va tintuv — eng og‘ir protsessual aralashuvlardan biri. Uni keyin «qonuniylashtirish» oldindan berilgan ruxsat emas.',
        'Sud qarori tintuvning asosi bo‘lsa, u voqeadan oldin mavjud bo‘lishi shart. Aks holda nazorat qog‘ozga aylanadi.',
        'Konstitutsiya shaxsiy daxlsizlikni kafolatlaydi. Kechikkan ruxsat bu kafolatni tiklamaydi, faqat buzilishni yashiradi.',
        'Himoyachi uchun savol sodda: ruxsat qachon berilgan — eshik ochilishidan oldinmi yoki keyinmi?',
      ],
      ru: [
        'Вход в жилище и обыск — одно из самых тяжёлых процессуальных вмешательств. Последующая «легализация» не заменяет предварительного разрешения.',
        'Если судебный акт — основание обыска, он должен существовать до события. Иначе контроль становится бумагой.',
        'Конституция гарантирует неприкосновенность. Позднее разрешение гарантию не восстанавливает.',
        'Для защитника вопрос прост: разрешение было до того, как открыли дверь, или после?',
      ],
      en: [
        'Entering a home to search is among the most severe process interventions. Retroactive “legalisation” is not a prior warrant.',
        'If a court act is the basis of the search, it must exist before the event. Otherwise oversight is theatre.',
        'The Constitution guarantees the home. A late stamp does not restore that guarantee.',
        'For counsel the question is simple: was permission given before the door opened, or after?',
      ],
    },
  },
  {
    slug: 'advokatni-sukutga-chagirish-emas',
    category: 'analysis',
    date: '2026-09-09',
    title: {
      uz: 'Sudni himoya qilishning yo‘li advokatni sukutga chaqirish emas',
      ru: 'Защищать суд — не значит призывать адвоката к молчанию',
      en: 'Protecting the court does not mean silencing the lawyer',
    },
    excerpt: {
      uz: 'Advokat ovozi sudga qarshi ovoz emas. U tortishuv prinsipining ikkinchi qanoti.',
      ru: 'Голос адвоката — не голос против суда. Это второе крыло состязательности.',
      en: 'A lawyer’s voice is not a voice against the court. It is the second wing of the adversarial process.',
    },
    image: 'art:scale',
    tags: {
      uz: ['advokat etikasi', 'oshkoralik', 'tortishuv'],
      ru: ['этика адвоката', 'гласность', 'состязательность'],
      en: ['ethics', 'open justice', 'adversarial process'],
    },
    body: {
      uz: [
        'Ochiq sud majlisidagi qonunbuzilish haqida gapirish — avtomatik ravishda bosim emas. Tanqid va ta’sir o‘rtasida farq bor.',
        'Advokat sirni oshkor etmasligi, yolg‘on tarqatmasligi va haqorat qilmasligi shart. Lekin himoya pozitsiyasi va ochiq muhokama o‘zi axloqsizlik emas.',
        'Sud obro‘si advokatni jim qilish bilan emas, asosli qaror va ochiqlik bilan mustahkamlanadi.',
        'Bir qanotni bog‘lab qo‘yib, odil sudlov parvoz qiladi deb bo‘lmaydi.',
      ],
      ru: [
        'Говорить о нарушении закона в открытом заседании — не автоматически давление. Критика и воздействие — разные вещи.',
        'Адвокат не вправе раскрывать тайну, распространять ложь и оскорблять. Но сама позиция защиты и публичность не являются неэтичными.',
        'Авторитет суда укрепляется не молчанием адвоката, а мотивированными решениями и открытостью.',
        'Связав одно крыло, нельзя говорить, что правосудие летает.',
      ],
      en: [
        'Speaking about an alleged breach in an open hearing is not automatically pressure. Criticism and interference are not the same.',
        'Counsel must keep privilege, avoid falsehood and refrain from insult. The defense position itself is not unethical.',
        'The court’s authority is strengthened by reasoned judgments and openness, not by a silenced advocate.',
        'Justice cannot be said to fly with one wing tied.',
      ],
    },
  },
  {
    slug: 'skrinshot-dalilmi',
    category: 'qa',
    date: '2026-08-09',
    title: {
      uz: 'Skrinshot bor — demak dalil ham bormi?',
      ru: 'Есть скриншот — значит есть доказательство?',
      en: 'There is a screenshot — is there evidence?',
    },
    excerpt: {
      uz: 'Ekrandagi rasm manbasi, butunligi va ishonchliligi tekshirilmaguncha taqdir hal qilmaydi.',
      ru: 'Картинка на экране не решает судьбу, пока не проверены источник, целостность и достоверность.',
      en: 'An image on a screen should not decide a person’s fate until source, integrity and reliability are tested.',
    },
    image: 'art:desk',
    tags: {
      uz: ['dalil', 'raqamli isbot', 'savol-javob'],
      ru: ['доказательства', 'цифровые данные', 'вопрос-ответ'],
      en: ['evidence', 'digital proof', 'Q&A'],
    },
    body: {
      uz: [
        'Skrinshot — bu tasvir. U qayerdan olingan, qachon, kim tomonidan va o‘zgartirilganmi — shu savollarsiz u zaif dalil.',
        'Jinoyat protsessida dalil qonuniy yo‘l bilan olinishi, manbasi ma’lum bo‘lishi va tekshirilishi kerak.',
        'Himoya skrinshotni inkor etmaydi. U uni tekshiradi. Agar zanjir uzilgan bo‘lsa, tasvir ayblovni ko‘tara olmaydi.',
      ],
      ru: [
        'Скриншот — изображение. Без вопросов «откуда, когда, кем и не изменено ли» это слабое доказательство.',
        'В уголовном процессе доказательство должно быть получено законно, иметь источник и поддаваться проверке.',
        'Защита не отрицает скриншот как таковой. Она его проверяет. Если цепочка разорвана, картинка обвинение не удержит.',
      ],
      en: [
        'A screenshot is an image. Without asking where, when, by whom and whether it was altered, it is weak evidence.',
        'In criminal procedure evidence must be obtained lawfully, have a source and be capable of being tested.',
        'The defense does not deny the screenshot as an object. It tests it. If the chain is broken, a picture cannot carry a charge.',
      ],
    },
  },
  {
    slug: '2027-qamoq-uchun-gumondan-kop',
    category: 'legislation',
    date: '2026-08-21',
    title: {
      uz: '2027-yil 1-iyuldan: qamoq uchun oddiy gumon yetarli bo‘lmaydi',
      ru: 'С 1 июля 2027 года: одного подозрения для ареста будет недостаточно',
      en: 'From 1 July 2027: mere suspicion will not justify detention',
    },
    excerpt: {
      uz: 'Tergov sudyasi asoslarni tekshirishi shart. Gumon — avtomatik qamoq emas.',
      ru: 'Следственный судья обязан проверить основания. Подозрение — не автоматический арест.',
      en: 'The investigative judge must test the grounds. Suspicion is not automatic custody.',
    },
    image: 'art:gavel',
    tags: {
      uz: ['qonunchilik', 'ehtiyot chora', 'tergov sudyasi'],
      ru: ['законодательство', 'мера пресечения', 'следственный судья'],
      en: ['legislation', 'detention', 'investigative judge'],
    },
    body: {
      uz: [
        'Yangi tartib ehtiyot chorani jiddiyroq filtrlashni nazarda tutadi. Sudya ushlab turishning qonuniyligi va asosliligini tekshirishi kerak.',
        'Agar shubha tug‘ilsa, qo‘shimcha hujjatlar so‘ralishi mumkin. Bu himoya uchun yangi protsessual imkoniyat.',
        'Amaliyot qonun matnidan ham muhim. Himoyachining vazifasi — ushbu filtrni qog‘ozda qoldirmaslik.',
      ],
      ru: [
        'Новый порядок предполагает более строгий фильтр меры пресечения. Судья обязан проверить законность и обоснованность задержания.',
        'При сомнениях могут быть запрошены дополнительные документы. Это новый процессуальный шанс для защиты.',
        'Практика важнее текста. Задача адвоката — не дать фильтру остаться на бумаге.',
      ],
      en: [
        'The new rules imply a stricter filter for detention. A judge must test lawfulness and justification.',
        'If doubts arise, further documents may be requested. That is a new procedural opening for the defense.',
        'Practice matters more than the text. Counsel’s task is to keep that filter off the page and in the courtroom.',
      ],
    },
  },
  {
    slug: 'himoya-huquqiga-cheklov',
    category: 'news',
    date: '2026-09-02',
    title: {
      uz: 'Himoya huquqiga qo‘yilgan cheklov: Konstitutsiyaviy sudga murojaat',
      ru: 'Ограничение права на защиту: обращение в Конституционный суд',
      en: 'A restriction on the right to defense: an application to the Constitutional Court',
    },
    excerpt: {
      uz: 'Konstitutsiyaning 28 va 29-moddalari ayblanuvchiga himoya va malakali yuridik yordamni kafolatlaydi.',
      ru: 'Статьи 28 и 29 Конституции гарантируют защиту и квалифицированную юридическую помощь.',
      en: 'Articles 28 and 29 of the Constitution guarantee defense and qualified legal assistance.',
    },
    image: 'art:hero',
    tags: {
      uz: ['himoya huquqi', 'konstitutsiya', 'yangilik'],
      ru: ['право на защиту', 'конституция', 'новости'],
      en: ['right to counsel', 'constitution', 'news'],
    },
    body: {
      uz: [
        'Himoya huquqi qulaylik emas — protsessning sharti. Uni cheklash ishning tengligini buzadi.',
        'Advokatning ishtiroki, materiallar bilan tanishish va dalil taqdim etish imkoniyati qisqarsa, sud adolat emas, tasdiqlashga aylanadi.',
        'Konstitutsiyaviy nazorat shu cheklovlarning qonuniyligini tekshirish uchun ochiq yo‘ldir. Himoya undan foydalanishi kerak.',
      ],
      ru: [
        'Право на защиту — не удобство, а условие процесса. Его ограничение ломает равенство сторон.',
        'Если участие адвоката, доступ к материалам и возможность представить доказательства сужаются, суд становится утверждением, а не правосудием.',
        'Конституционный контроль — открытый путь проверить законность таких ограничений. Защита должна им пользоваться.',
      ],
      en: [
        'The right to defense is not a courtesy. It is a condition of a fair process. Restricting it breaks equality of arms.',
        'If counsel’s presence, access to the file and the ability to tender evidence shrink, a court becomes a rubber stamp.',
        'Constitutional review is an open path to test such limits. Defense counsel should use it.',
      ],
    },
  },
]
