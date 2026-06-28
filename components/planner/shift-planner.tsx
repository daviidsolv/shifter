"use client"

import { useCallback, useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  PartyPopper,
  Star,
  UsersRound,
} from "lucide-react"
import {
  VENUES,
  WEEKDAYS_SHORT,
  addMonths,
  isSameDay,
  isSameMonth,
  keyFor,
  monthDates,
  monthGridDates,
  monthLabel,
  startOfMonth,
  toISO,
  type DaySchedule,
  type PlannerState,
  type Schedule,
  type Worker,
} from "@/lib/planner"
import { cn } from "@/lib/utils"
import { ManageSheet } from "./manage-sheet"
import { PlannerHeader } from "./planner-header"
import { WorkersSheet } from "./workers-sheet"

const EMPTY: DaySchedule = { normal: [], events: [] }

type SaveStatus = "idle" | "saving" | "error"

export function ShiftPlanner({ initialState }: { initialState: PlannerState }) {
  const [venueId, setVenueId] = useState(VENUES[0].id)
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()))
  const [plannerState, setPlannerState] = useState<PlannerState>(initialState)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editKey, setEditKey] = useState(0)
  const [workersOpen, setWorkersOpen] = useState(false)

  const { schedule, workers } = plannerState
  const venue = VENUES.find((v) => v.id === venueId) ?? VENUES[0]
  const monthDays = useMemo(() => monthDates(monthStart), [monthStart])
  const calendarDays = useMemo(() => monthGridDates(monthStart), [monthStart])
  const weekdayLabels = useMemo(
    () => [1, 2, 3, 4, 5, 6, 0].map((day) => WEEKDAYS_SHORT[day]),
    [],
  )
  const today = new Date()

  const workersById = useMemo(
    () => new Map(workers.map((w) => [w.id, w])),
    [workers],
  )

  const getSchedule = (date: Date): DaySchedule =>
    schedule[keyFor(venueId, toISO(date))] ?? EMPTY

  const stats = useMemo(() => {
    let openDays = 0
    let shifts = 0
    let events = 0

    for (const d of monthDays) {
      if (venue.openDays.includes(d.getDay())) openDays++
      const s = getSchedule(d)
      shifts += s.normal.length
      events += s.events.length
    }

    return { openDays, shifts, events }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDays, schedule, venueId])

  const openManage = (date: Date) => {
    setSelectedDate(date)
    setEditKey((k) => k + 1)
  }

  const persistState = useCallback(async (nextState: PlannerState) => {
    setSaveStatus("saving")

    try {
      const response = await fetch("/api/planner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState),
      })

      if (!response.ok) {
        throw new Error("Planner save failed")
      }

      const savedState = (await response.json()) as PlannerState
      setPlannerState(savedState)
      setSaveStatus("idle")
    } catch {
      setSaveStatus("error")
    }
  }, [])

  const handleSave = (next: DaySchedule) => {
    if (!selectedDate) return

    const nextState: PlannerState = {
      schedule: {
        ...schedule,
        [keyFor(venueId, toISO(selectedDate))]: next,
      },
      workers,
    }

    setPlannerState(nextState)
    setSelectedDate(null)
    void persistState(nextState)
  }

  const handleAddWorker = (worker: Worker) => {
    const nextState: PlannerState = {
      schedule,
      workers: [...workers, worker],
    }

    setPlannerState(nextState)
    void persistState(nextState)
  }

  const handleRemoveWorker = (workerId: string) => {
    const nextSchedule: Schedule = Object.fromEntries(
      Object.entries(schedule).map(([key, daySchedule]) => [
        key,
        {
          normal: daySchedule.normal.filter((id) => id !== workerId),
          events: daySchedule.events.map((event) => ({
            ...event,
            workerIds: event.workerIds.filter((id) => id !== workerId),
          })),
        },
      ]),
    )
    const nextState: PlannerState = {
      schedule: nextSchedule,
      workers: workers.filter((worker) => worker.id !== workerId),
    }

    setPlannerState(nextState)
    void persistState(nextState)
  }

  const handleDownloadImage = async () => {
    await downloadPlanningImage({
      monthStart,
      monthDays,
      schedule,
      workers,
    })
  }

  const isCurrentMonth = isSameMonth(monthStart, today)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col gap-4 px-4 py-5">
      <PlannerHeader onOpenWorkers={() => setWorkersOpen(true)} />

      <SyncStatus status={saveStatus} />

      {/* Venue selector */}
      <div className="flex flex-wrap gap-2">
        {VENUES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVenueId(v.id)}
            aria-pressed={v.id === venueId}
            className={cn(
              "rounded-full border-[3px] border-ink px-4 py-1.5 font-display text-xs tracking-[1px] shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
              v.id === venueId ? "bg-ink text-cream" : "bg-cream text-ink",
            )}
          >
            {v.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dashboard card */}
      <section className="rounded-3xl border-[3px] border-ink bg-cream p-4 shadow-(--shadow-hard-lg)">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[10px] tracking-[3px] text-muted-ink">
              MES
            </p>
            <p className="font-display text-2xl leading-none text-ink">
              {monthLabel(monthStart).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setMonthStart((m) => addMonths(m, -1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-ink bg-warm shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={3} />
            </button>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setMonthStart((m) => addMonths(m, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-ink bg-warm shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat
            value={stats.openDays}
            label="APERTURAS"
            className="bg-red text-ink"
            icon={<CalendarDays className="h-4 w-4" strokeWidth={2.75} />}
          />
          <Stat
            value={stats.shifts}
            label="TURNOS"
            className="bg-green text-cream"
          />
          <Stat
            value={stats.events}
            label="ESPECIALES"
            className="bg-pink text-cream"
            icon={<PartyPopper className="h-4 w-4" strokeWidth={2.75} />}
          />
        </div>

        <button
          type="button"
          onClick={handleDownloadImage}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-ink bg-warm font-display text-[11px] tracking-[2px] text-ink shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Download className="h-4 w-4" strokeWidth={3} />
          DESCARGAR IMAGEN GLOBAL
        </button>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => setMonthStart(startOfMonth(today))}
            className="mt-3 w-full rounded-xl border-[3px] border-ink bg-paper py-1.5 font-display text-[11px] tracking-[2px] text-ink shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            VOLVER A ESTE MES
          </button>
        )}
      </section>

      {/* Section label */}
      <div className="flex items-center gap-3">
        <span className="h-0.75 flex-1 bg-ink/15" />
        <span className="inline-flex rounded-[10px] border-[3px] border-ink bg-red px-3 py-0.5 font-display text-[11px] tracking-[3px] text-ink shadow-(--shadow-hard-sm)">
          DIAS / {monthDays.length}
        </span>
        <span className="h-0.75 flex-1 bg-ink/15" />
      </div>

      {/* Month grid */}
      <section className="rounded-[20px] border-[3px] border-ink bg-cream p-2 shadow-(--shadow-hard-lg)">
        <div className="grid grid-cols-7 gap-1">
          {weekdayLabels.map((day) => (
            <div
              key={day}
              className="flex h-7 items-center justify-center font-display text-[10px] tracking-[1px] text-muted-ink"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((d) => {
            const inMonth = isSameMonth(d, monthStart)

            return (
              <MonthDayButton
                key={toISO(d)}
                date={d}
                isToday={isSameDay(d, today)}
                isOpen={venue.openDays.includes(d.getDay())}
                isInMonth={inMonth}
                schedule={getSchedule(d)}
                workersById={workersById}
                onManage={() => {
                  if (!inMonth) setMonthStart(startOfMonth(d))
                  openManage(d)
                }}
              />
            )
          })}
        </div>
      </section>

      <ManageSheet
        key={editKey}
        open={selectedDate !== null}
        date={selectedDate}
        venueName={venue.name}
        schedule={selectedDate ? getSchedule(selectedDate) : EMPTY}
        workers={workers}
        onClose={() => setSelectedDate(null)}
        onSave={handleSave}
      />

      <WorkersSheet
        open={workersOpen}
        workers={workers}
        onClose={() => setWorkersOpen(false)}
        onAdd={handleAddWorker}
        onRemove={handleRemoveWorker}
      />
    </div>
  )
}

function SyncStatus({ status }: { status: SaveStatus }) {
  if (status === "idle") return null

  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border-[3px] border-ink px-3 py-1.5 text-center font-display text-[10px] tracking-[2px] shadow-(--shadow-hard-sm)",
        status === "saving" ? "bg-warm text-ink" : "bg-pink text-cream",
      )}
    >
      {status === "saving" ? "GUARDANDO EN SERVIDOR" : "ERROR AL GUARDAR"}
    </div>
  )
}

type PlanningImageInput = {
  monthStart: Date
  monthDays: Date[]
  schedule: Schedule
  workers: Worker[]
}

async function downloadPlanningImage({
  monthStart,
  monthDays,
  schedule,
  workers,
}: PlanningImageInput) {
  if ("fonts" in document) {
    await document.fonts.ready
  }

  const margin = 56
  const dateWidth = 156
  const minWidth = 1400
  const minWorkerWidth = 112
  const minWorkerColumnsWidth = minWidth - margin * 2 - dateWidth
  const workerColumnsWidth = Math.max(
    minWorkerColumnsWidth,
    workers.length * minWorkerWidth,
  )
  const workerWidth =
    workers.length > 0 ? workerColumnsWidth / workers.length : 0
  const width = margin * 2 + dateWidth + workerColumnsWidth
  const contentWidth = width - margin * 2
  const tableX = margin
  const tableY = 300
  const headerRowHeight = 86
  const colors = {
    paper: "#f4efd8",
    cream: "#fff8dd",
    warm: "#ffe6b7",
    ink: "#171717",
    muted: "#6f6a5d",
    red: "#e75b55",
    green: "#21945e",
    pink: "#e9447b",
    gray: "#6f6a5d",
  }
  const venueColors = [colors.green, colors.pink, colors.red, colors.gray]

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const tableRows = monthDays
    .map((date) => {
      const iso = toISO(date)
      const openVenues = VENUES.filter((v) =>
        v.openDays.includes(date.getDay()),
      )
      const assignmentsByWorker = new Map<string, string[]>()
      let maxAssignments = 0

      for (const worker of workers) {
        const assignments = VENUES.filter((v) => {
          const daySchedule = schedule[keyFor(v.id, iso)] ?? EMPTY
          const worksNormal = daySchedule.normal.includes(worker.id)
          const worksEvent = daySchedule.events.some((event) =>
            event.workerIds.includes(worker.id),
          )

          return worksNormal || worksEvent
        }).map((v) => v.name)

        assignmentsByWorker.set(worker.id, assignments)
        maxAssignments = Math.max(maxAssignments, assignments.length)
      }

      return {
        date,
        openVenues,
        assignmentsByWorker,
        height: Math.max(72, 34 + Math.max(1, maxAssignments) * 30),
      }
    })
    .filter((row) => row.openVenues.length > 0)

  const assignedCells = tableRows.reduce(
    (total, row) =>
      total +
      workers.reduce(
        (sum, worker) =>
          sum + (row.assignmentsByWorker.get(worker.id)?.length ?? 0),
        0,
      ),
    0,
  )
  const openVenueDays = tableRows.reduce(
    (total, row) => total + row.openVenues.length,
    0,
  )
  const eventCount = tableRows.reduce(
    (total, row) =>
      total +
      VENUES.reduce(
        (sum, v) =>
          sum + (schedule[keyFor(v.id, toISO(row.date))]?.events.length ?? 0),
        0,
      ),
    0,
  )
  const footerHeight = 74
  const height =
    tableY +
    headerRowHeight +
    tableRows.reduce((sum, row) => sum + row.height, 0) +
    footerHeight

  canvas.width = width
  canvas.height = height

  ctx.fillStyle = colors.paper
  ctx.fillRect(0, 0, width, height)

  drawRoundedRect(ctx, margin, 42, contentWidth, 204, 28, colors.red, colors.ink, 6)
  ctx.fillStyle = colors.ink
  ctx.font = "900 54px Arial Black, Impact, sans-serif"
  ctx.fillText("PLANIFICACION GLOBAL", margin + 34, 112)
  ctx.font = "800 34px Arial, sans-serif"
  ctx.fillText("TODOS LOS LOCALES", margin + 34, 162)
  ctx.font = "700 28px Arial, sans-serif"
  ctx.fillStyle = colors.cream
  ctx.fillText(monthLabel(monthStart).toUpperCase(), margin + 34, 202)

  let legendX = margin + 34
  for (const [index, v] of VENUES.entries()) {
    const fill = venueColors[index % venueColors.length]
    const pillWidth = drawPill(
      ctx,
      legendX,
      234,
      v.name,
      fill,
      colors.cream,
      colors.ink,
    )
    legendX += pillWidth + 12
  }

  const statY = 74
  const statWidth = 178
  drawImageStat(ctx, width - margin - statWidth * 3 - 28, statY, statWidth, "LOCALES", VENUES.length, colors)
  drawImageStat(ctx, width - margin - statWidth * 2 - 14, statY, statWidth, "APERTURAS", openVenueDays, colors)
  drawImageStat(ctx, width - margin - statWidth, statY, statWidth, "ASIGN.", assignedCells, colors)

  drawRoundedRect(
    ctx,
    tableX,
    tableY,
    contentWidth,
    headerRowHeight,
    18,
    colors.ink,
    colors.ink,
    4,
  )
  ctx.fillStyle = colors.cream
  ctx.font = "900 22px Arial Black, Impact, sans-serif"
  ctx.fillText("DIA", tableX + 22, tableY + 50)

  for (const [index, worker] of workers.entries()) {
    const x = tableX + dateWidth + index * workerWidth
    drawTableCell(ctx, x, tableY, workerWidth, headerRowHeight, colors.ink, colors.cream)
    ctx.fillStyle = colors.cream
    ctx.font = "900 17px Arial Black, Impact, sans-serif"
    for (const [lineIndex, line] of wrapCanvasText(ctx, worker.name, workerWidth - 18).slice(0, 2).entries()) {
      ctx.fillText(line, x + 10, tableY + 32 + lineIndex * 20)
    }
    ctx.font = "700 14px Arial, sans-serif"
    ctx.fillStyle = colors.warm
  }

  let y = tableY + headerRowHeight
  for (const row of tableRows) {
    const isWeekend = row.date.getDay() === 0 || row.date.getDay() === 6
    const dayFill = colors.warm

    drawTableCell(ctx, tableX, y, dateWidth, row.height, dayFill, colors.ink)
    ctx.fillStyle = colors.ink
    ctx.font = "900 24px Arial Black, Impact, sans-serif"
    ctx.fillText(`${WEEKDAYS_SHORT[row.date.getDay()]} ${row.date.getDate()}`, tableX + 18, y + 34)
    ctx.font = "700 15px Arial, sans-serif"
    ctx.fillStyle = colors.muted
    ctx.fillText(row.openVenues.map((v) => v.name).join(" / "), tableX + 18, y + 60)

    for (const [index, worker] of workers.entries()) {
      const x = tableX + dateWidth + index * workerWidth
      const assignments = row.assignmentsByWorker.get(worker.id) ?? []
      drawTableCell(
        ctx,
        x,
        y,
        workerWidth,
        row.height,
        isWeekend ? colors.cream : "#fffcef",
        colors.ink,
      )

      assignments.forEach((venueName, venueIndex) => {
        const venueColorIndex = VENUES.findIndex((v) => v.name === venueName)
        const fill = venueColors[Math.max(0, venueColorIndex) % venueColors.length]
        drawCenteredPill(
          ctx,
          x + 10,
          y + 14 + venueIndex * 30,
          workerWidth - 20,
          24,
          venueName,
          fill,
          colors.cream,
          colors.ink,
        )
      })

      if (assignments.length === 0) {
        ctx.fillStyle = colors.muted
        ctx.font = "700 18px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("-", x + workerWidth / 2, y + row.height / 2 + 7)
        ctx.textAlign = "left"
      }
    }

    y += row.height
  }

  ctx.fillStyle = colors.muted
  ctx.font = "700 20px Arial, sans-serif"
  ctx.fillText(
    `Especiales: ${eventCount} · Generado el ${new Date().toLocaleDateString("es-ES")} desde Shifter`,
    margin,
    height - 34,
  )

  const fileName = `planificacion-global-${monthStart.getFullYear()}-${String(
    monthStart.getMonth() + 1,
  ).padStart(2, "0")}.png`

  canvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, "image/png")
}

function drawTableCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
) {
  ctx.fillStyle = fill
  ctx.fillRect(x, y, width, height)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, width, height)
}

function drawImageStat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: number,
  colors: Record<string, string>,
) {
  drawRoundedRect(ctx, x, y, width, 108, 18, colors.cream, colors.ink, 5)
  ctx.fillStyle = colors.ink
  ctx.font = "900 42px Arial Black, Impact, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(String(value), x + width / 2, y + 48)
  ctx.font = "800 17px Arial, sans-serif"
  ctx.fillText(label, x + width / 2, y + 82)
  ctx.textAlign = "left"
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fill: string,
  color: string,
  border: string,
) {
  ctx.font = "900 18px Arial, sans-serif"
  const width = ctx.measureText(text).width + 28
  drawRoundedRect(ctx, x, y - 20, width, 30, 10, fill, border, 4)
  ctx.fillStyle = color
  ctx.fillText(text, x + 14, y + 2)
  return width
}

function drawCenteredPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  fill: string,
  color: string,
  border: string,
) {
  drawRoundedRect(ctx, x, y, width, height, 8, fill, border, 3)
  ctx.fillStyle = color
  ctx.font = "900 15px Arial Black, Impact, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(text, x + width / 2, y + 17)
  ctx.textAlign = "left"
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke: string,
  lineWidth: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = stroke
  ctx.stroke()
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine
      continue
    }

    if (currentLine) lines.push(currentLine)
    currentLine = word
  }

  if (currentLine) lines.push(currentLine)
  return lines.length > 0 ? lines : [text]
}

function MonthDayButton({
  date,
  isToday,
  isOpen,
  isInMonth,
  schedule,
  workersById,
  onManage,
}: {
  date: Date
  isToday: boolean
  isOpen: boolean
  isInMonth: boolean
  schedule: DaySchedule
  workersById: Map<string, Worker>
  onManage: () => void
}) {
  const workerCount = schedule.normal.filter((id) => workersById.has(id)).length
  const eventCount = schedule.events.length
  const hasPlan = workerCount > 0 || eventCount > 0
  const status = isOpen ? "abierto" : "cerrado"

  return (
    <button
      type="button"
      onClick={onManage}
      aria-label={`${WEEKDAYS_SHORT[date.getDay()]} ${date.getDate()}, ${status}, ${workerCount} turnos, ${eventCount} especiales`}
      className={cn(
        "relative flex min-h-16 flex-col overflow-hidden rounded-[10px] border-2 p-1 text-left shadow-(--shadow-hard-sm) transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:min-h-17.5 sm:rounded-[14px] sm:border-[3px] sm:p-1.5",
        isOpen ? "bg-cream" : "bg-warm/45",
        isInMonth
          ? "border-ink"
          : "border-ink/30 opacity-45 shadow-none",
        isToday && "outline outline-offset-1 outline-pink",
      )}
    >
      <span className="sr-only">{status}</span>
      <span
        className={cn(
          "font-display text-base leading-none",
          isInMonth ? "text-ink" : "text-muted-ink",
        )}
      >
        {date.getDate()}
      </span>
      {isToday && (
        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-ink bg-pink text-cream sm:h-5 sm:w-5">
          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
        </span>
      )}

      <span
        className={cn(
          "mt-1 h-2 w-2 rounded-full border-2 border-ink sm:h-2.5 sm:w-2.5",
          isOpen ? "bg-green" : "bg-gray-warm",
        )}
        aria-hidden="true"
      />

      <span className="mt-auto flex min-h-8 flex-wrap items-end gap-0.5 sm:min-h-5 sm:gap-1">
        {workerCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center gap-0.5 rounded border-2 border-ink bg-green px-0.5 font-display text-[9px] leading-none text-cream sm:h-5 sm:min-w-5 sm:rounded-md sm:px-1">
            <UsersRound className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
            {workerCount}
          </span>
        )}
        {eventCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center gap-0.5 rounded border-2 border-ink bg-pink px-0.5 font-display text-[9px] leading-none text-cream sm:h-5 sm:min-w-5 sm:rounded-md sm:px-1">
            <PartyPopper className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
            {eventCount}
          </span>
        )}
        {!hasPlan && isOpen && (
          <span
            className="h-1.5 w-5 rounded-full bg-ink/20"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  )
}

function Stat({
  value,
  label,
  className,
  icon,
}: {
  value: number
  label: string
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-h-16 flex-col items-center justify-center rounded-2xl border-[3px] border-ink px-2 py-2 shadow-(--shadow-hard-sm)",
        className,
      )}
    >
      <span className="flex items-center gap-1 font-display text-2xl leading-none">
        {icon}
        {value}
      </span>
      <span className="mt-1 font-display text-[9px] tracking-[2px]">
        {label}
      </span>
    </div>
  )
}
