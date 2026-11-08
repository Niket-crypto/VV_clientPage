import { useState, useRef, useEffect } from "react"
import { Calculator, ChevronRight, Send, Snowflake, Truck } from "lucide-react"
import {
  BODY_SURCHARGE,
  CITIES,
  calculateDelivery,
  findCity,
  formatMoney,
  WINCH_FEE,
  type BodyType,
  type CarrierType,
} from "./calculateDelivery"

const TELEGRAM_HANDLE = "vv_carriers"

export interface CalcTexts {
  title: string
  from: string
  to: string
  placeholder: string
  errRequired: string
  errUnknown: string
  errSame: string
  body: string
  bodyOptions: Record<BodyType, string>
  carrier: string
  carrierOptions: Record<CarrierType, { name: string; desc: string }>
  winch: string
  submit: string
  resultTitle: string
  rangeFrom: string
  rangeTo: string
  approx: string
  details: string
  detailRoute: string
  detailCarrier: string
  detailBody: string
  detailWinch: string
  order: string
  msg: string
}

interface Props {
  t: CalcTexts
  lang: "uk" | "en"
  carrier: CarrierType
  onCarrierChange: (c: CarrierType) => void
}

const BODIES: BodyType[] = ["sedan", "crossover", "suv", "van"]
const CARRIERS: CarrierType[] = ["economy", "evacuator", "vip"]

const fieldBase =
  "h-12 w-full border bg-black pl-4 pr-12 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/40"

interface CityInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  error: string
  submitted: boolean
  placeholder: string
  lang: "uk" | "en"
}

function CitySelectField({
  label,
  value,
  onChange,
  error,
  submitted,
  placeholder,
  lang,
}: CityInputProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Закрываем выпадающий список при клике вне поля
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Фильтруем города по введённому тексту (или показываем все, если поле пустое / нажата стрелка)
  const filteredCities = CITIES.filter((c) => {
    const q = value.trim().toLowerCase()
    if (!q) return true
    return (
      c.uk.toLowerCase().includes(q) ||
      c.en.toLowerCase().includes(q)
    )
  })

  return (
    <div ref={containerRef} className="relative block">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-gray-300">{label} *</span>
        <div className="relative flex items-center">
          <input
            type="text"
            value={value}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            placeholder={placeholder}
            aria-invalid={submitted && !!error}
            className={`${fieldBase} ${
              submitted && error ? "border-red-500" : "border-white/20"
            }`}
          />

          {/* Фирменная стрелочка: смотрит вправо (0deg), при открытии поворачивается вниз (90deg) и меняет размер */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle cities list"
            className="absolute right-2 flex h-9 w-9 cursor-pointer items-center justify-center text-[var(--accent)] transition-transform duration-200 active:scale-75 select-none"
          >
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 ease-out ${
                open ? "rotate-90 scale-115" : "rotate-0 scale-100"
              }`}
            />
          </button>
        </div>
      </label>

      {/* Выпадающее меню со списком городов */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto border border-white/20 bg-[#121214] py-1 shadow-xl"
        >
          {(filteredCities.length > 0 ? filteredCities : CITIES).map((c) => (
            <li
              key={c.id}
              role="option"
              aria-selected={value === c[lang]}
              onClick={() => {
                onChange(c[lang])
                setOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] hover:text-black active:bg-[var(--accent)] active:text-black"
            >
              <span>{c[lang]}</span>
              <span className="text-xs uppercase opacity-60">{c.country}</span>
            </li>
          ))}
        </ul>
      )}

      {submitted && error && (
        <span className="mt-1 block text-sm text-red-400">{error}</span>
      )}
    </div>
  )
}

export default function DeliveryCalculator({ t, lang, carrier, onCarrierChange }: Props) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [body, setBody] = useState<BodyType>("sedan")
  const [inoperable, setInoperable] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const from = findCity(origin)
  const to = findCity(destination)

  const originError = !origin.trim() ? t.errRequired : !from ? t.errUnknown : ""
  const destError = !destination.trim()
    ? t.errRequired
    : !to
      ? t.errUnknown
      : from && from.id === to.id
        ? t.errSame
        : ""
  const valid = !originError && !destError

  const result =
    submitted && valid && from && to
      ? calculateDelivery({ origin: from, destination: to, body, carrier, inoperable })
      : null
  const money = (n: number) => (result ? formatMoney(n, result.currency, lang) : "")

  const telegramHref = () => {
    if (!result || !from || !to) return "#"
    const text = [
      t.msg,
      `${t.from}: ${from[lang]}`,
      `${t.to}: ${to[lang]}`,
      `${t.body}: ${t.bodyOptions[body]}`,
      `${t.carrier}: ${t.carrierOptions[carrier].name}`,
      inoperable ? t.winch : "",
      `${t.resultTitle}: ${t.rangeFrom} ${money(result.from)} ${t.rangeTo} ${money(result.to)}`,
    ]
      .filter(Boolean)
      .join("\n")
    return `https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(text)}`
  }

  const row = (label: string, value: number, hidden = false) =>
    hidden ? null : (
      <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="whitespace-nowrap font-bold text-white">+ {money(value)}</span>
      </div>
    )

  return (
    <div className="rounded-3xl bg-[var(--primary)] p-3 text-white sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 px-1 font-display text-2xl font-bold sm:mb-6 sm:text-3xl">
        <span className="h-6 w-1.5 bg-[var(--accent)] sm:h-8" />
        {t.title}
      </h2>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
        }}
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <CitySelectField
              label={t.from}
              value={origin}
              onChange={setOrigin}
              error={originError}
              submitted={submitted}
              placeholder={t.placeholder}
              lang={lang}
            />
            <CitySelectField
              label={t.to}
              value={destination}
              onChange={setDestination}
              error={destError}
              submitted={submitted}
              placeholder={t.placeholder}
              lang={lang}
            />
          </div>

          {/* Тип кузова */}
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-300">{t.body}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BODIES.map((b) => (
                <label key={b} className="cursor-pointer">
                  <input
                    type="radio"
                    name="body"
                    checked={body === b}
                    onChange={() => setBody(b)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full min-h-12 flex-col items-center justify-center border border-white/20 bg-black px-2 py-2 text-center text-sm font-semibold transition-all hover:border-[var(--accent)] active:scale-95 peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:text-[var(--accent-foreground)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/60">
                    {t.bodyOptions[b]}
                    {BODY_SURCHARGE[b] > 0 && (
                      <span className="text-xs opacity-80">+{BODY_SURCHARGE[b] * 100}%</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Тип автовоза */}
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-300">{t.carrier}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {CARRIERS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="carrier"
                    checked={carrier === c}
                    onChange={() => onCarrierChange(c)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full flex-col gap-1 border border-white/20 bg-black p-3 transition-all hover:border-[var(--accent)] active:scale-95 peer-checked:border-[var(--accent)] peer-checked:ring-2 peer-checked:ring-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/60">
                    <span className="flex items-center gap-2 font-bold">
                      {c === "vip" ? (
                        <Snowflake className="h-4 w-4 text-[var(--accent)]" />
                      ) : (
                        <Truck className="h-4 w-4 text-[var(--accent)]" />
                      )}
                      {t.carrierOptions[c].name}
                    </span>
                    <span className="text-xs text-gray-400">{t.carrierOptions[c].desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Переключатель «не на ходу» */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={inoperable}
              onChange={(e) => setInoperable(e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-gray-700 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/60" />
            <span className="text-sm">
              {t.winch} (+{WINCH_FEE.UAH} {lang === "uk" ? "грн" : "UAH"} / +{WINCH_FEE.EUR} €)
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-[var(--accent)] px-8 font-bold text-[var(--accent-foreground)] transition-all hover:bg-yellow-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
          >
            <Calculator className="h-5 w-5" />
            {t.submit}
          </button>
        </div>

        {/* Блок результата */}
        <div aria-live="polite" className="lg:pt-7">
          {result && from && to ? (
            <div className="rounded-3xl border-2 border-[var(--accent)] bg-black p-5 sm:p-6">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
                {t.resultTitle}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-[var(--accent)] sm:text-4xl">
                {t.rangeFrom} {money(result.from)} {t.rangeTo} {money(result.to)}
              </div>
              <div className="mt-1 text-sm text-gray-400">
                {from[lang]} → {to[lang]} · ~{result.distanceKm} km
              </div>

              <div className="mt-5 divide-y divide-white/10 border-t border-white/10">
                <div className="pt-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t.details}
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
                  <span className="text-gray-300">{t.detailRoute}</span>
                  <span className="whitespace-nowrap font-bold">{money(result.base)}</span>
                </div>
                {row(t.detailCarrier, result.carrierExtra, result.carrierExtra === 0)}
                {row(t.detailBody, result.bodyExtra, result.bodyExtra === 0)}
                {row(t.detailWinch, result.winchExtra, result.winchExtra === 0)}
              </div>

              <p className="mt-3 text-xs text-gray-500">{t.approx}</p>

              <a
                href={telegramHref()}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 border-2 border-[var(--accent)] font-bold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] active:scale-95"
              >
                <Send className="h-4 w-4" />
                {t.order}
              </a>
            </div>
          ) : (
            <div className="hidden h-full min-h-48 items-center justify-center rounded-3xl border-2 border-dashed border-white/20 p-6 text-center text-sm text-gray-500 lg:flex">
              {t.approx}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}