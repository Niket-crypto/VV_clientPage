import { useEffect, useState, useRef } from "react"
import DeliveryCalculator from "./DeliveryCalculator"
import type { CarrierType } from "./calculateDelivery"
import { sendTelegramMessage } from "./Utils/sendTelegram"
import {
  ArrowRight,
  Film,
  Image as ImageIcon,
  Phone,
  Send,
  Star,
  X,
} from "lucide-react"
import { FaInstagram, FaTelegramPlane, FaTiktok } from "react-icons/fa"

type Lang = "uk" | "en"

const HERO_VIDEO = "/АвтовозКайф.mp4"

const CARD_PHOTOS = [
  "/avtovoz-1-1.jpg",
  "/avtovoz-2.jpg",
  "/avtovoz-3.jpg",
  "/avtovoz-8.jpg",
]

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/vv_evakuator/",
    icon: FaInstagram,
    hoverClass: "hover:border-white hover:text-pink-400",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@vv_evakuator",
    icon: FaTiktok,
    hoverClass: "hover:border-white hover:text-black",
  },
  {
    name: "Telegram",
    href: "https://t.me/VV_EVAKUATOR",
    icon: FaTelegramPlane,
    hoverClass: "hover:border-white hover:text-sky-400",
  },
] as const

const OUTLINE = "text-white"

const CARD_CARRIERS: CarrierType[] = ["vip", "evacuator", "evacuator", "economy"]

const dict = {
  uk: {
    title: "vv — Автовози та логістика",
    tagline: "Vv_Evacuator",
    nav: { fleet: "Автовози", pricing: "Дізнатися тарифи", about: "Про нас" },
    cta: "Отримати розрахунок",
    hero: {
      title: "Дбайлива доставка вашого авто в будь-яку точку.",
      text: "Спеціалізовані послуги автовозів для приватних осіб і бізнесу. Відкриті, закриті автовози та евакуатори для будь-яких типів транспортних засобів.",
      primary: "Оформити заявку",
      secondary: "Отримати розрахунок",
      rating: "Рейтинг довіри",
    },
    modal: {
      title: "Швидка заявка на перевезення",
      subtitle: "Залиште свої контакти, і наш логіст зв'яжеться з вами протягом 10 хвилин.",
      nameLabel: "Як вас звати?",
      namePlaceholder: "Наприклад, Олександр",
      phoneLabel: "Номер телефону",
      phonePlaceholder: "+380 (__) ___-__-__",
      submit: "Надіслати заявку",
      sending: "Відправляємо...",
      invalidPhone: "Будь ласка, введіть коректний номер телефону",
      successMsg: "Дякуємо! Заявку прийнято, ми зв'яжемося з вами найближчим часом.",
      errorMsg: "Помилка відправки. Спробуйте ще раз або зателефонуйте нам.",
    },
    pricing: {
      title: "Тарифи на доставку авто",
      routeHead: "Маршрут",
      priceHead: "Евакуатор",
      rows: [
        { route: "Львів – Одеса", price: "13 000 – 15 000 грн" },
        { route: "Львів – Київ", price: "10 000 – 12 000 грн" },
        { route: "Львів – Дніпро", price: "15 000 – 17 000 грн" },
        { route: "Львів – Харків", price: "15 000 – 17 000 грн" },
        { route: "Київ – Варшава", price: "800 – 1000 €" },
        { route: "Київ – Відень", price: "800 – 1000 €" },
        { route: "Київ – Німеччина", price: "від 800 €" },
        { route: "Київ – Барселона", price: "від 1600 €" },
        { route: "Іспанія – Львів", price: "від 1500 €" },
        { route: "Німеччина – Львів", price: "900 €" },
        { route: "Нідерланди – Львів", price: "900 – 1000 €" },
        { route: "Київ – Афіни", price: "від 2000 €" },
      ],
    },
    fleet: {
      title: "Види автовозів",
      cards: [
        {
          title: "Автовоз для одного авто",
          points: [
            "Закритий автовоз Brian James Shuttle",
            "Повний захист автомобіля в дорозі",
            "Ідеально для перевезення одного авто",
          ],
        },
        {
          title: "Автовоз для двох авто",
          points: [
            "База Renault Master або Mercedes Sprinter",
            "Економічне рішення для доставки",
            "Підходить для маршрутів по Україні",
          ],
        },
        {
          title: "Автовоз для трьох авто",
          points: [
            "Модель Iveco Daily",
            "Часто використовується для доставки з Європи",
            "Зручний для приватних замовлень",
          ],
        },
        {
          title: "Автовоз для восьми авто",
          points: [
            "Великий автовоз Volvo FM9 Lohr",
            "Найкраща ціна при масовому перевезенні",
            "Працюємо по всій Україні та Європі",
          ],
        },
      ],
    },
    calc: {
      title: "Калькулятор вартості доставки",
      from: "Звідки",
      to: "Куди",
      placeholder: "Почніть вводити місто",
      errRequired: "Вкажіть місто",
      errUnknown: "Оберіть місто зі списку",
      errSame: "Міста відправлення та призначення збігаються",
      body: "Тип кузова авто",
      bodyOptions: {
        sedan: "Седан / Хетчбек",
        crossover: "Кросовер",
        suv: "Позашляховик / SUV",
        van: "Мікроавтобус",
      },
      carrier: "Тип автовоза",
      carrierOptions: {
        economy: { name: "Збірний автовоз", desc: "Економ, множник 1.0" },
        evacuator: { name: "Евакуатор", desc: "Окреме авто, множник 1.1" },
        vip: { name: "Закритий VIP Brian James", desc: "Повний захист, множник 1.6" },
      },
      winch: "Авто не на ходу (потрібна лебідка)",
      submit: "Розрахувати вартість",
      resultTitle: "Орієнтовна вартість",
      rangeFrom: "від",
      rangeTo: "до",
      approx: "Розрахунок орієнтовний. Точну ціну підтвердить менеджер після уточнення деталей.",
      details: "Деталізація",
      detailRoute: "Базовий маршрут",
      detailCarrier: "Доплата за тип автовоза",
      detailBody: "Доплата за тип авто",
      detailWinch: "Лебідка",
      order: "Оформити заявку в Telegram",
      msg: "Доброго дня! Хочу замовити доставку авто.",
    },
    stats: [
      { value: "15+", label: "Років на ринку" },
      { value: "10к+", label: "Доставлених авто" },
      { value: "100%", label: "Страхування вантажу" },
      { value: "24/7", label: "Підтримка в дорозі" },
    ],
    media: {
      video: "Місце для відео",
      videoWhat: "Фоновий ролик: автовоз в русі, завантаження авто, дорога",
      videoWhy:
        "Одразу показує реальну техніку в роботі й створює довіру. Звук вимкнений, ролик крутиться по колу.",
      videoSpec: "mp4, 1920×1080, 10–20 с, до 8 МБ",
      photo: "Фото",
    },
    footer: {
      rights: "© 2024 Усі права захищено.",
      terms: "Умови використання",
      privacy: "Політика конфіденційності",
    },
    menu: "Меню",
    close: "Закрити",
  },
  en: {
    title: "vv — Car Transport & Logistics",
    tagline: "Vv_Evacuator",
    nav: { fleet: "Car carriers", pricing: "See pricing", about: "About us" },
    cta: "Get a quote",
    hero: {
      title: "Careful delivery of your car to any destination.",
      text: "Specialised car carrier services for individuals and businesses. Open and enclosed carriers and tow trucks for every type of vehicle.",
      primary: "Submit a request",
      secondary: "Get a quote",
      rating: "Trust rating",
    },
    modal: {
      title: "Quick transport request",
      subtitle: "Leave your details and our logistics specialist will contact you within 10 minutes.",
      nameLabel: "Your name",
      namePlaceholder: "e.g., Alex",
      phoneLabel: "Phone number",
      phonePlaceholder: "+380 (__) ___-__-__",
      submit: "Send request",
      sending: "Sending...",
      invalidPhone: "Please enter a valid phone number",
      successMsg: "Thank you! Request received, we will contact you shortly.",
      errorMsg: "Failed to send. Please try again.",
    },
    pricing: {
      title: "Car delivery rates",
      routeHead: "Route",
      priceHead: "Tow truck",
      rows: [
        { route: "Lviv – Odesa", price: "13 000 – 15 000 UAH" },
        { route: "Lviv – Kyiv", price: "10 000 – 12 000 UAH" },
        { route: "Lviv – Dnipro", price: "15 000 – 17 000 UAH" },
        { route: "Lviv – Kharkiv", price: "15 000 – 17 000 UAH" },
        { route: "Kyiv – Warsaw", price: "800 – 1000 €" },
        { route: "Kyiv – Vienna", price: "800 – 1000 €" },
        { route: "Kyiv – Germany", price: "from 800 €" },
        { route: "Kyiv – Barcelona", price: "from 1600 €" },
        { route: "Spain – Lviv", price: "from 1500 €" },
        { route: "Germany – Lviv", price: "900 €" },
        { route: "Netherlands – Lviv", price: "900 – 1000 €" },
        { route: "Kyiv – Athens", price: "from 2000 €" },
      ],
    },
    fleet: {
      title: "Types of car carriers",
      cards: [
        {
          title: "Single-car carrier",
          points: [
            "Enclosed carrier Brian James Shuttle",
            "Full protection of the car on the road",
            "Ideal for transporting a single car",
          ],
        },
        {
          title: "Two-car carrier",
          points: [
            "Renault Master or Mercedes Sprinter base",
            "Economical delivery solution",
            "Suitable for routes within Ukraine",
          ],
        },
        {
          title: "Three-car carrier",
          points: [
            "Iveco Daily model",
            "Often used for deliveries from Europe",
            "Convenient for private orders",
          ],
        },
        {
          title: "Eight-car carrier",
          points: [
            "Large Volvo FM9 Lohr carrier",
            "Best price for bulk transport",
            "We operate across Ukraine and Europe",
          ],
        },
      ],
    },
    calc: {
      title: "Delivery cost calculator",
      from: "From",
      to: "To",
      placeholder: "Start typing a city",
      errRequired: "Enter a city",
      errUnknown: "Pick a city from the list",
      errSame: "Origin and destination are the same",
      body: "Vehicle body type",
      bodyOptions: {
        sedan: "Sedan / Hatchback",
        crossover: "Crossover",
        suv: "SUV",
        van: "Minibus",
      },
      carrier: "Carrier type",
      carrierOptions: {
        economy: { name: "Shared carrier", desc: "Economy, multiplier 1.0" },
        evacuator: { name: "Tow truck", desc: "Single car, multiplier 1.1" },
        vip: { name: "Enclosed VIP Brian James", desc: "Full protection, multiplier 1.6" },
      },
      winch: "Car does not run (winch required)",
      submit: "Calculate cost",
      resultTitle: "Estimated cost",
      rangeFrom: "from",
      rangeTo: "to",
      approx: "This is an estimate. A manager will confirm the exact price after clarifying the details.",
      details: "Breakdown",
      detailRoute: "Base route",
      detailCarrier: "Carrier type surcharge",
      detailBody: "Body type surcharge",
      detailWinch: "Winch",
      order: "Submit request via Telegram",
      msg: "Hello! I would like to order a car delivery.",
    },
    stats: [
      { value: "15+", label: "Years on the market" },
      { value: "10k+", label: "Cars delivered" },
      { value: "100%", label: "Cargo insurance" },
      { value: "24/7", label: "Support on the road" },
    ],
    media: {
      video: "Video placeholder",
      videoWhat:
        "Background clip: a car carrier on the move, loading cars, the road",
      videoWhy:
        "Instantly shows real equipment at work and builds trust. Muted and looped.",
      videoSpec: "mp4, 1920×1080, 10–20 s, up to 8 MB",
      photo: "Photo",
    },
    footer: {
      rights: "© 2024 All rights reserved.",
      terms: "Terms of use",
      privacy: "Privacy policy",
    },
    menu: "Menu",
    close: "Close",
  },
} as const

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "uk"
  const saved = window.localStorage.getItem("lang")
  return saved === "en" || saved === "uk" ? saved : "uk"
}

function Logo() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="font-display text-3xl font-bold tracking-tighter">
        vv
      </span>
    )
  }
  return (
    <img
      src="/NewVv.png"
      alt="vv"
      onError={() => setFailed(true)}
      className="max-h-10"
    />
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const [menuOpen, setMenuOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [phoneValue, setPhoneValue] = useState("+380 ")
  const [phoneError, setPhoneError] = useState("")
  const [clientName, setClientName] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [carrier, setCarrier] = useState<CarrierType>("economy")
  const [carrierSelected, setCarrierSelected] = useState(false)
  const [videoFailed, setVideoFailed] = useState(!HERO_VIDEO)
  const [isSending, setIsSending] = useState(false)
  const [fleetVisible, setFleetVisible] = useState(false)
  const [pricingVisible, setPricingVisible] = useState(false)
  const [aboutVisible, setAboutVisible] = useState(false)

  const t = dict[lang]

  const ElementRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
    window.localStorage.setItem("lang", lang)
  }, [lang, t.title])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOrderModalOpen(false)
    }
    if (orderModalOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [orderModalOpen])

  useEffect(() => {
    const Observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === ElementRef.current[0]) {
            setFleetVisible(entry.intersectionRatio >= 0.2)
          }

          if (entry.target === ElementRef.current[1]) {
            setPricingVisible(entry.intersectionRatio >= 0.2)
          }

          if (entry.target === ElementRef.current[2]) {
            if (entry.intersectionRatio >= 0.75) {
              setAboutVisible(true)
              Observer.unobserve(entry.target)
            }
          }
        })
      },
      { threshold: [0, 0.2, 0.3, 0.75] }
    )

    ElementRef.current.forEach((el) => {
      if (el) Observer.observe(el)
    })

    return () => {
      Observer.disconnect()
    }
  }, [])

  const navLinks = [
    { href: "#fleet", label: t.nav.fleet },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#about", label: t.nav.about },
  ]

  const selectCarrier = (c: CarrierType) => {
    setCarrier(c)
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSending) return

    const digitsOnly = phoneValue.replace(/\D/g, "")
    // Ровно 380 + 9 цифр = 12 цифр. Если нужно 8 цифр после 380, замени {9} на {8}
    const isValidUaPhone = /^380\d{9}$/.test(digitsOnly)

    if (!isValidUaPhone) {
      setPhoneError(
        lang === "uk"
          ? "Введіть коректний номер: +380 та ще 9 цифр"
          : "Enter a valid number: +380 followed by 9 digits"
      )
      return
    }

    setPhoneError("")
    setIsSending(true)

    const cleanName = clientName.trim() || "Не вказано"
    const carrierText = carrierSelected
      ? t.calc.carrierOptions[carrier].name
      : "Тип автовоза не обрано"

    const message = [
      `<b>🚨 Нова заявка з сайту!</b>`,
      `<b>👤 Ім'я:</b> ${cleanName}`,
      `<b>📞 Телефон:</b> +${digitsOnly}`,
      `<b>🚛 Автовоз:</b> ${carrierText}`,
      `<b>🕒 Час:</b> ${new Date().toLocaleString("uk-UA")}`,
    ].join("\n")

    const ok = await sendTelegramMessage(message)
    setIsSending(false)

    if (ok) {
      setSubmitSuccess(true)
      setClientName("")
      setPhoneValue("+380 ")
      setTimeout(() => {
        setSubmitSuccess(false)
        setOrderModalOpen(false)
      }, 2000)
    } else {
      setPhoneError(t.modal.errorMsg)
    }
  }

  const langSwitch = (
    <div
      role="group"
      aria-label="Language"
      className="flex h-10 items-center border border-[var(--border)] text-xs font-bold"
    >
      {(["uk", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-full px-3 uppercase transition-colors active:scale-95 ${lang === l
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "hover:bg-gray-50 active:bg-gray-100"
            }`}
        >
          {l === "uk" ? "UA" : "EN"}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)]">
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="ml-2 hidden border-l border-gray-300 bg-[var(--accent)] px-2 py-0.5 text-base font-bold text-black sm:inline-block">
              {t.tagline}
            </span>
          </div>
          <nav
            className="hidden items-center gap-8 text-sm font-medium min-[855px]:flex"
            aria-label="Main"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[var(--accent)] active:text-[var(--accent)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {langSwitch}
            <a
              href="#calculator"
              className="hidden h-10 items-center justify-center bg-[var(--primary)] px-6 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-gray-900 active:scale-95 active:bg-black min-[855px]:inline-flex"
            >
              {t.cta}
            </a>
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 transition-transform duration-300 ease-in-out active:scale-90 min-[855px]:hidden"
              aria-label={menuOpen ? t.close : t.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block h-0.75 w-6 bg-black transition-all duration-300 ease-in-out ${menuOpen ? "translate-y-[9px] rotate-45" : ""
                  }`}
              />
              <span
                className={`block h-0.75 w-6 bg-black transition-all duration-300 ease-in-out ${menuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`block h-0.75 w-6 bg-black transition-all duration-300 ease-in-out ${menuOpen ? "-translate-y-[9px] -rotate-45" : ""
                  }`}
              />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[var(--border)] bg-[var(--background)] min-[855px]:hidden">
            <nav
              className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6"
              aria-label="Mobile"
            >
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-[var(--border)] py-3 text-sm font-medium active:text-[var(--accent)]"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#calculator"
                onClick={() => setMenuOpen(false)}
                className="my-4 inline-flex h-11 items-center justify-center bg-[var(--primary)] text-sm font-medium text-[var(--primary-foreground)] active:scale-95"
              >
                {t.cta}
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ===== Блок 1: видео на фоне ===== */}
        <section className="relative isolate overflow-hidden bg-[#0b0b0c] text-white">
          {!videoFailed && (
            <video
              className="absolute inset-0 -z-20 h-full w-full object-cover will-change-transform"
              src={HERO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => setVideoFailed(true)}
            />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

          <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 md:min-h-[640px] lg:min-h-[720px] lg:px-8">
            <div className="max-w-2xl">
              <h1 className="mb-6 font-display text-4xl font-bold tracking-tight sm:text-6xl">
                {t.hero.title}
              </h1>
              <p className="mb-8 max-w-xl text-lg text-gray-200">
                {t.hero.text}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(true)}
                  className="inline-flex h-12 cursor-pointer items-center justify-center bg-[var(--accent)] px-8 text-base font-bold text-[var(--accent-foreground)] transition-all hover:bg-yellow-400 active:scale-95 active:bg-yellow-400 select-none"
                >
                  {t.hero.primary} <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <a
                  href="#calculator"
                  className="inline-flex h-12 cursor-pointer items-center justify-center border-2 border-white bg-transparent px-8 text-base font-bold text-white transition-all hover:bg-white hover:text-black active:scale-95 active:bg-white active:text-black select-none"
                >
                  {t.hero.secondary}
                </a>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Star className="h-5 w-5 text-black" fill="currentColor" />
                </div>
                <div className="leading-tight">
                  <p className="font-display text-lg font-bold">4.9/5</p>
                  <p className="text-xs text-gray-300">{t.hero.rating}</p>
                </div>
              </div>
            </div>

            {videoFailed && (
              <div className="mt-10 max-w-md self-start border-2 border-dashed border-white/30 bg-white/5 p-4 lg:absolute lg:bottom-8 lg:right-8 lg:mt-0">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60">
                  <Film className="h-4 w-4" />
                  {t.media.video}
                </div>
                <p className="mt-2 font-display text-sm font-bold">
                  {t.media.videoWhat}
                </p>
                <p className="mt-1 text-xs text-white/60">{t.media.videoWhy}</p>
                <p className="mt-2 text-xs text-white/40">
                  {t.media.videoSpec}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===== Блок 2: плашка с видами автовозов ===== */}
        <section
          id="fleet"
          ref={(el) => {
            if (el) ElementRef.current[0] = el
          }}
          className="scroll-mt-20 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[var(--primary)] p-3 sm:p-6">
              <h2
                className={`mb-4 flex items-center gap-3 px-1 font-display text-2xl font-bold text-white transition-all duration-700 sm:mb-6 sm:text-3xl ${fleetVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
                  }`}
              >
                <span className="h-6 w-1.5 bg-[var(--accent)] sm:h-8" />
                {t.fleet.title}
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {t.fleet.cards.map((card, i) => (
                  <div
                    key={card.title}
                    role="button"
                    tabIndex={0}
                    aria-pressed={carrier === CARD_CARRIERS[i]}
                    onClick={() => selectCarrier(CARD_CARRIERS[i])}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        selectCarrier(CARD_CARRIERS[i])
                      }
                    }}
                    style={{ transitionDelay: `${i * 120}ms` }}
                    className={`gradient-border cursor-pointer transition-all duration-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 ${fleetVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                      }`}
                  >
                    <article className="relative isolate aspect-[4/3] min-w-0 overflow-hidden rounded-3xl bg-[var(--card)] @container sm:aspect-[16/10]">
                      {CARD_PHOTOS[i] ? (
                        <img
                          src={CARD_PHOTOS[i]}
                          alt={card.title}
                          loading="lazy"
                          className="absolute inset-0 -z-10 h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${t.media.photo}: ${card.title}`}
                          className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-[var(--card)] text-gray-400"
                        >
                          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            {t.media.photo}
                          </span>
                        </div>
                      )}

                      <div className="flex h-full flex-col justify-between p-[4.5cqw]">
                        <h3
                          className={`max-w-[80%] self-start font-display text-[clamp(1.125rem,5.2cqw,1.875rem)] font-bold leading-tight ${OUTLINE}`}
                        >
                          {card.title}
                        </h3>

                        <ul
                          className={`w-fit max-w-[72%] space-y-[1.2cqw] self-end text-left text-[clamp(0.75rem,2.8cqw,1rem)] font-semibold leading-snug ${OUTLINE}`}
                        >
                          {card.points.map((p) => (
                            <li key={p} className="flex items-start gap-[1.5cqw]">
                              <span className="mt-[0.45em] h-[0.5em] w-[0.5em] shrink-0 bg-[var(--accent)]" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Блок: тарифы ===== */}
        <section
          id="pricing"
          ref={(el) => {
            if (el) ElementRef.current[1] = el
          }}
          className="scroll-mt-20 pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[var(--primary)] p-3 sm:p-6">
              <h2
                className={`mb-4 flex items-center gap-3 px-1 font-display text-2xl font-bold text-white transition-all duration-700 sm:mb-6 sm:text-3xl ${pricingVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
                  }`}
              >
                <span className="h-6 w-1.5 bg-[var(--accent)] sm:h-8" />
                {t.pricing.title}
              </h2>

              <div className="mx-auto flex max-w-3xl flex-col gap-3">
                <div className="flex justify-between px-6 text-xs font-bold uppercase tracking-widest text-gray-400 sm:px-8 sm:text-sm">
                  <span>{t.pricing.routeHead}</span>
                  <span>{t.pricing.priceHead}</span>
                </div>
                {t.pricing.rows.map((row, idx) => (
                  <div
                    key={row.route}
                    style={{ transitionDelay: `${idx * 45}ms` }}
                    className={`flex items-center justify-between gap-4 rounded-full border-2 border-[var(--accent)] bg-black px-6 py-3 text-white transition-all duration-500 active:scale-[0.98] sm:px-8 sm:py-4 ${pricingVisible
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-8 opacity-0"
                      }`}
                  >
                    <span className="font-display text-base font-semibold sm:text-xl">
                      {row.route}
                    </span>
                    <span className="whitespace-nowrap text-right text-sm font-bold text-[var(--accent)] sm:text-lg">
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Блок 3: цифры «Про нас» ===== */}
        <section
          id="about"
          ref={(el) => {
            if (el) ElementRef.current[2] = el
          }}
          className="scroll-mt-20 relative overflow-hidden border-y border-[var(--border)] bg-black text-[var(--primary-foreground)]"
        >
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
            <div
              className={`flex items-center text-[var(--accent)] drop-shadow-[0_0_20px_rgba(249,115,22,0.45)] ${aboutVisible ? "animate-tow-truck" : "opacity-0 -translate-x-full"
                }`}
            >
              <svg
                viewBox="0 0 180 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-auto md:h-28"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="2" y1="35" x2="22" y2="35" className="opacity-40" />
                <line x1="8" y1="48" x2="28" y2="48" className="opacity-60" />
                <line x1="0" y1="60" x2="18" y2="60" className="opacity-30" />
                <path d="M25 54 L35 50 L115 50 L115 58 L28 58 Z" />
                <path
                  d="M42 44 L50 32 L78 32 L88 41 L98 43 L98 50 L40 50 Z"
                  className="opacity-90"
                />
                <circle cx="54" cy="48" r="5" fill="#000" />
                <circle cx="84" cy="48" r="5" fill="#000" />
                <path d="M115 50 L115 26 L104 34" />
                <line x1="104" y1="34" x2="96" y2="42" strokeDasharray="3 3" />
                <path d="M118 28 H144 L156 42 V58 H118 V28 Z" />
                <path d="M124 33 H141 L149 42 H124 V33 Z" />
                <path d="M128 23 H136 V28 H128 Z" fill="currentColor" />
                <line x1="132" y1="16" x2="132" y2="19" />
                <line x1="122" y1="19" x2="125" y2="21" />
                <line x1="142" y1="19" x2="139" y2="21" />
                <path
                  d="M157 49 L176 44 L176 56 L157 53 Z"
                  fill="currentColor"
                  className="opacity-25"
                  stroke="none"
                />
                <circle cx="52" cy="60" r="9" fill="#000" />
                <circle cx="52" cy="60" r="3" />
                <circle cx="76" cy="60" r="9" fill="#000" />
                <circle cx="76" cy="60" r="3" />
                <circle cx="138" cy="60" r="9" fill="#000" />
                <circle cx="138" cy="60" r="3" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 ">
              {t.stats.map((s, index) => (
                <div
                  key={s.label}
                  className={`px-4 text-center opacity-0 border-white/10 ${index % 2 === 0 ? "border-r" : "border-r-0"
                    } ${index < 3 ? "md:border-r" : "md:border-r-0"
                    } ${aboutVisible ? "animate-stat-reveal" : ""
                    }`}
                  style={{
                    animationDelay: `${0.45 + index * 0.45}s`,
                  }}
                >
                  <div className="font-display text-4xl font-bold text-[var(--accent)]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section id="calculator" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DeliveryCalculator
            t={t.calc}
            lang={lang}
            carrier={carrier}
            onCarrierChange={setCarrier}
          />
        </div>
      </section>

      {/* ===== МОДАЛКА: Оформити заявку ===== */}
      {orderModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/75 transition-opacity"
            onClick={() => setOrderModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121214] p-6 text-white shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all hover:bg-white/20 active:scale-90"
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                <Phone className="h-3.5 w-3.5" />
                Vv_Evacuator
              </span>
              <h3
                id="modal-title"
                className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {t.modal.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {t.modal.subtitle}
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Поле имени */}
              <div>
                <label
                  htmlFor="name-input"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300"
                >
                  {lang === "uk" ? "Як вас звати?" : "Your name"}
                </label>
                <input
                  id="name-input"
                  type="text"
                  autoFocus
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={
                    lang === "uk" ? "Наприклад, Олександр" : "e.g., Alex"
                  }
                  className="h-14 w-full rounded-2xl border border-white/20 bg-black/50 px-4 text-lg font-semibold text-white placeholder-gray-500 transition-colors focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              {/* Поле телефона */}
              <div>
                <label
                  htmlFor="phone-input"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300"
                >
                  {t.modal.phoneLabel}
                </label>
                <div className="relative">
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="tel"
                    required
                    value={phoneValue}
                    onChange={(e) => {
                      setPhoneValue(e.target.value)
                      if (phoneError) setPhoneError("")
                    }}
                    placeholder={t.modal.phonePlaceholder}
                    className={`h-14 w-full rounded-2xl border bg-black/50 px-4 text-lg font-semibold text-white placeholder-gray-500 transition-colors focus:outline-none ${phoneError
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/20 focus:border-[var(--accent)]"
                      }`}
                  />
                </div>
                {phoneError && (
                  <p className="mt-2 text-xs font-semibold text-red-400">
                    {phoneError}
                  </p>
                )}
                {submitSuccess && (
                  <p className="mt-2 text-xs font-semibold text-green-400">
                    {lang === "uk"
                      ? "Дякуємо! Заявку відправлено, ми скоро зв'яжемося з вами."
                      : "Thank you! Request sent, we will contact you soon."}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-base font-bold text-black transition-all hover:bg-yellow-400 active:scale-95 active:bg-yellow-400 disabled:opacity-50 select-none"
              >
                <Send className="h-4 w-4" />
                {isSending
                  ? lang === "uk"
                    ? "Відправляємо..."
                    : "Sending..."
                  : t.modal.submit}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-[var(--border)] bg-[var(--background)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-sm font-medium text-gray-500">
              {t.footer.rights}
            </span>
          </div>

          <nav aria-label="Social media" className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ name, href, icon: Icon, hoverClass }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-gray-700 transition-all hover:scale-110 active:scale-95 ${hoverClass}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-black active:text-black">
              {t.footer.terms}
            </a>
            <a href="#" className="hover:text-black active:text-black">
              {t.footer.privacy}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}