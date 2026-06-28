export type WorkerColor = "red" | "green" | "pink" | "gray" | "warm"

export type Worker = {
  id: string
  name: string
  role: string
  color: WorkerColor
}

export type Venue = {
  id: string
  name: string
  /** Días de apertura habituales. 0 = Domingo ... 6 = Sábado */
  openDays: number[]
}

export type EventType = "reserva" | "cumple" | "otro"

export type SpecialEvent = {
  id: string
  title: string
  type: EventType
  time: string
  workerIds: string[]
}

/** key => `${venueId}|${isoDate}` */
export type DaySchedule = {
  normal: string[]
  events: SpecialEvent[]
}

export type Schedule = Record<string, DaySchedule>

export type PlannerState = {
  schedule: Schedule
  workers: Worker[]
}

export type PlannerPersistenceMode = "server" | "browser"

const WORKER_COLORS = new Set<WorkerColor>([
  "red",
  "green",
  "pink",
  "gray",
  "warm",
])

const EVENT_TYPES = new Set<EventType>(["reserva", "cumple", "otro"])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function normalizeWorker(value: unknown): Worker | null {
  if (!isRecord(value)) return null

  const { id, name, role, color } = value
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof role !== "string" ||
    typeof color !== "string" ||
    !WORKER_COLORS.has(color as WorkerColor)
  ) {
    return null
  }

  return { id, name, role, color: color as WorkerColor }
}

function normalizeEvent(value: unknown): SpecialEvent | null {
  if (!isRecord(value)) return null

  const { id, title, type, time, workerIds } = value
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof type !== "string" ||
    !EVENT_TYPES.has(type as EventType) ||
    typeof time !== "string" ||
    !isStringArray(workerIds)
  ) {
    return null
  }

  return {
    id,
    title,
    type: type as EventType,
    time,
    workerIds,
  }
}

function normalizeDaySchedule(value: unknown): DaySchedule | null {
  if (!isRecord(value)) return null

  const { normal, events } = value
  if (!isStringArray(normal) || !Array.isArray(events)) return null

  const normalizedEvents = events.map(normalizeEvent)
  if (normalizedEvents.some((event) => event === null)) return null

  return {
    normal,
    events: normalizedEvents as SpecialEvent[],
  }
}

function normalizeSchedule(value: unknown): Schedule | null {
  if (!isRecord(value)) return null

  const schedule: Schedule = {}
  for (const [key, daySchedule] of Object.entries(value)) {
    const normalizedDay = normalizeDaySchedule(daySchedule)
    if (!normalizedDay) return null
    schedule[key] = normalizedDay
  }

  return schedule
}

export function normalizePlannerState(value: unknown): PlannerState | null {
  if (!isRecord(value)) return null

  const schedule = normalizeSchedule(value.schedule)
  if (!schedule || !Array.isArray(value.workers)) return null

  const workers = value.workers.map(normalizeWorker)
  if (workers.some((worker) => worker === null)) return null

  return {
    schedule,
    workers: workers as Worker[],
  }
}

export const WEEKDAYS_SHORT = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]
export const WEEKDAYS_LONG = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

export const EVENT_LABELS: Record<EventType, string> = {
  reserva: "Reserva",
  cumple: "Cumpleaños",
  otro: "Especial",
}

export const WORKER_BG: Record<WorkerColor, string> = {
  red: "bg-red text-cream",
  green: "bg-green text-cream",
  pink: "bg-pink text-cream",
  gray: "bg-gray-warm text-cream",
  warm: "bg-warm text-ink",
}

export const VENUES: Venue[] = [
  { id: "mess", name: "MESS", openDays: [5, 6] },
  { id: "loft", name: "LOFT", openDays: [5, 6] },
]

export const WORKERS: Worker[] = [
  { id: "w2", name: "Paula", role: "Barra", color: "green" },
  { id: "w3", name: "Xenia", role: "Barra", color: "pink" },
  { id: "w4", name: "Carla", role: "Barra", color: "gray" },
  { id: "w5", name: "Cristina", role: "Barra", color: "warm" },
  { id: "w6", name: "Aitor", role: "Seguridad", color: "red" },
  { id: "w7", name: "Riki", role: "Seguridad", color: "green" },
  { id: "w8", name: "Ludger", role: "Seguridad", color: "pink" },
  { id: "w9", name: "Aziz", role: "Seguridad", color: "gray" },
]

export function seedSchedule(date = new Date()): Schedule {
  const venueId = VENUES[0].id
  const ws = startOfWeek(date)
  const fri = toISO(addDays(ws, 4))
  const sat = toISO(addDays(ws, 5))

  return {
    [keyFor(venueId, fri)]: {
      normal: ["w1", "w2", "w4", "w6"],
      events: [
        {
          id: "ev1",
          title: "Cumple de Laura",
          type: "cumple",
          time: "23:30",
          workerIds: ["w5"],
        },
      ],
    },
    [keyFor(venueId, sat)]: {
      normal: ["w1", "w2", "w3", "w4", "w6", "w7"],
      events: [
        {
          id: "ev2",
          title: "Reserva zona VIP",
          type: "reserva",
          time: "01:00",
          workerIds: ["w8"],
        },
      ],
    },
  }
}

export function defaultPlannerState(date = new Date()): PlannerState {
  return {
    schedule: seedSchedule(date),
    workers: WORKERS.map((worker) => ({ ...worker })),
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function keyFor(venueId: string, iso: string): string {
  return `${venueId}|${iso}`
}

/** Lunes de la semana que contiene `date` */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7 // días desde el lunes
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function weekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addMonths(date: Date, months: number): Date {
  const d = startOfMonth(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function monthDates(monthStart: Date): Date[] {
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate()

  return Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i))
}

export function monthGridDates(monthStart: Date): Date[] {
  const first = startOfWeek(monthStart)
  const lastDayOfMonth = addDays(addMonths(monthStart, 1), -1)
  const last = addDays(startOfWeek(lastDayOfMonth), 6)
  const days = Math.round((last.getTime() - first.getTime()) / 86400000) + 1

  return Array.from({ length: days }, (_, i) => addDays(first, i))
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISO(a) === toISO(b)
}

export function monthLabel(monthStart: Date): string {
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  return `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}`
}

export function weekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const sameMonth = weekStart.getMonth() === end.getMonth()
  const monthNames = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ]
  if (sameMonth) {
    return `${weekStart.getDate()} – ${end.getDate()} ${monthNames[end.getMonth()]}`
  }
  return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
