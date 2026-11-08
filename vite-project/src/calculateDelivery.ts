// Чистая логика расчёта стоимости доставки: без React, легко тестируется

export type BodyType = "sedan" | "crossover" | "suv" | "van"
export type CarrierType = "economy" | "evacuator" | "vip"
export type Currency = "UAH" | "EUR"

export interface City {
  id: string
  uk: string
  en: string
  country: "UA" | "EU"
  lat: number
  lon: number
}

// Популярные города (координаты нужны для оценки расстояния)
export const CITIES: City[] = [
  { id: "kyiv", uk: "Київ", en: "Kyiv", country: "UA", lat: 50.45, lon: 30.52 },
  { id: "lviv", uk: "Львів", en: "Lviv", country: "UA", lat: 49.84, lon: 24.03 },
  { id: "odesa", uk: "Одеса", en: "Odesa", country: "UA", lat: 46.48, lon: 30.73 },
  { id: "dnipro", uk: "Дніпро", en: "Dnipro", country: "UA", lat: 48.46, lon: 35.05 },
  { id: "kharkiv", uk: "Харків", en: "Kharkiv", country: "UA", lat: 49.99, lon: 36.23 },
  { id: "zaporizhzhia", uk: "Запоріжжя", en: "Zaporizhzhia", country: "UA", lat: 47.84, lon: 35.14 },
  { id: "vinnytsia", uk: "Вінниця", en: "Vinnytsia", country: "UA", lat: 49.23, lon: 28.47 },
  { id: "warsaw", uk: "Варшава", en: "Warsaw", country: "EU", lat: 52.23, lon: 21.01 },
  { id: "berlin", uk: "Берлін", en: "Berlin", country: "EU", lat: 52.52, lon: 13.4 },
  { id: "munich", uk: "Мюнхен", en: "Munich", country: "EU", lat: 48.14, lon: 11.58 },
  { id: "vienna", uk: "Відень", en: "Vienna", country: "EU", lat: 48.21, lon: 16.37 },
  { id: "prague", uk: "Прага", en: "Prague", country: "EU", lat: 50.08, lon: 14.44 },
  { id: "amsterdam", uk: "Амстердам", en: "Amsterdam", country: "EU", lat: 52.37, lon: 4.9 },
  { id: "paris", uk: "Париж", en: "Paris", country: "EU", lat: 48.86, lon: 2.35 },
  { id: "madrid", uk: "Мадрид", en: "Madrid", country: "EU", lat: 40.42, lon: -3.7 },
  { id: "barcelona", uk: "Барселона", en: "Barcelona", country: "EU", lat: 41.39, lon: 2.17 },
  { id: "athens", uk: "Афіни", en: "Athens", country: "EU", lat: 37.98, lon: 23.73 },
]

// Доплата за тип кузова (доля от базы)
export const BODY_SURCHARGE: Record<BodyType, number> = {
  sedan: 0,
  crossover: 0.15,
  suv: 0.3,
  van: 0.45,
}

// Множитель типа автовоза
export const CARRIER_MULTIPLIER: Record<CarrierType, number> = {
  economy: 1,
  evacuator: 1.1,
  vip: 1.6,
}

// Лебёдка для авто не на ходу
export const WINCH_FEE: Record<Currency, number> = { UAH: 1500, EUR: 50 }

// Ставка сборного автовоза за км: первые TIER_KM по базовой цене, дальше дешевле
const RATE_PER_KM: Record<Currency, { base: number; far: number }> = {
  UAH: { base: 17, far: 17 },
  EUR: { base: 0.98, far: 0.5 },
}
const TIER_KM = 800
// Минимальная стоимость маршрута
const MIN_BASE: Record<Currency, number> = { UAH: 5000, EUR: 300 }
// Коэффициент «дорога длиннее прямой»
const ROAD_FACTOR = 1.2
// Вилка итоговой цены: ±8%
const RANGE_SPREAD = 0.08
// Шаг округления
const ROUND_STEP: Record<Currency, number> = { UAH: 100, EUR: 10 }

export interface DeliveryInput {
  origin: City
  destination: City
  body: BodyType
  carrier: CarrierType
  inoperable: boolean
}

export interface DeliveryResult {
  currency: Currency
  distanceKm: number
  base: number
  carrierExtra: number
  bodyExtra: number
  winchExtra: number
  total: number
  from: number
  to: number
}

// Ищем город по тексту на любом языке
export function findCity(query: string): City | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return CITIES.find((c) => c.id === q || c.uk.toLowerCase() === q || c.en.toLowerCase() === q)
}

// Расстояние по прямой (формула гаверсинусов), км
function haversineKm(a: City, b: City): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step

export function calculateDelivery(input: DeliveryInput): DeliveryResult {
  const { origin, destination, body, carrier, inoperable } = input
  const currency: Currency =
    origin.country === "UA" && destination.country === "UA" ? "UAH" : "EUR"
  const distanceKm = Math.round(haversineKm(origin, destination) * ROAD_FACTOR)

  const rate = RATE_PER_KM[currency]
  const near = Math.min(distanceKm, TIER_KM) * rate.base
  const far = Math.max(distanceKm - TIER_KM, 0) * rate.far
  const step = ROUND_STEP[currency]

  const base = roundTo(Math.max(near + far, MIN_BASE[currency]), step)
  const carrierExtra = roundTo(base * (CARRIER_MULTIPLIER[carrier] - 1), step)
  const bodyExtra = roundTo(base * CARRIER_MULTIPLIER[carrier] * BODY_SURCHARGE[body], step)
  const winchExtra = inoperable ? WINCH_FEE[currency] : 0

  const total = base + carrierExtra + bodyExtra + winchExtra
  return {
    currency,
    distanceKm,
    base,
    carrierExtra,
    bodyExtra,
    winchExtra,
    total,
    from: roundTo(total * (1 - RANGE_SPREAD), step),
    to: roundTo(total * (1 + RANGE_SPREAD), step),
  }
}

export function formatMoney(n: number, currency: Currency, locale: string): string {
  const num = n.toLocaleString(locale)
  return currency === "UAH" ? `${num} ${locale === "uk" ? "грн" : "UAH"}` : `${num} €`
}
