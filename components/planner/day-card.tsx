"use client"

import { Cake, CalendarCheck, ChevronRight, Sparkles, Star } from "lucide-react"
import {
  EVENT_LABELS,
  WEEKDAYS_SHORT,
  type DaySchedule,
  type EventType,
  type Worker,
} from "@/lib/planner"
import { cn } from "@/lib/utils"
import { WorkerAvatar } from "./worker-avatar"

const EVENT_ICON: Record<EventType, typeof Cake> = {
  reserva: CalendarCheck,
  cumple: Cake,
  otro: Sparkles,
}

export function DayCard({
  date,
  isToday,
  isOpen,
  schedule,
  workersById,
  onManage,
}: {
  date: Date
  isToday: boolean
  isOpen: boolean
  schedule: DaySchedule
  workersById: Map<string, Worker>
  onManage: () => void
}) {
  const normalWorkers = schedule.normal
    .map((id) => workersById.get(id))
    .filter((w): w is Worker => Boolean(w))
  const events = schedule.events
  const hasPlan = normalWorkers.length > 0 || events.length > 0

  return (
    <article
      className={cn(
        "relative rounded-[20px] border-[3px] border-ink p-3.5 shadow-[var(--shadow-hard-md)]",
        isOpen ? "bg-cream" : "bg-warm/40",
      )}
    >
      {isToday && (
        <span className="absolute -right-1.5 -top-3 z-10 inline-flex items-center gap-1 rounded-[9px] border-[3px] border-ink bg-pink px-2.5 py-0.5 font-display text-[10px] tracking-[2px] text-cream shadow-[var(--shadow-hard-sm)]">
          <Star className="h-3 w-3" strokeWidth={3} /> HOY
        </span>
      )}

      <div className="flex items-stretch gap-3.5">
        {/* Date sticker */}
        <div
          className={cn(
            "flex w-16 shrink-0 flex-col items-center justify-center rounded-[14px] border-[3px] border-ink py-2 shadow-[var(--shadow-hard-sm)]",
            isOpen ? "bg-red text-ink" : "bg-cream text-muted-ink",
          )}
        >
          <span className="font-display text-[11px] tracking-[2px]">
            {WEEKDAYS_SHORT[date.getDay()]}
          </span>
          <span className="font-display text-3xl leading-none tracking-[-1px] text-ink">
            {date.getDate()}
          </span>
        </div>

        {/* Body */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex rounded-md border-[3px] border-ink px-2 py-0.5 font-display text-[10px] tracking-[2px] shadow-[var(--shadow-hard-sm)]",
                isOpen ? "bg-green text-cream" : "bg-gray-warm text-cream",
              )}
            >
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
            {events.length > 0 && (
              <span className="inline-flex rounded-md border-[3px] border-ink bg-pink px-2 py-0.5 font-display text-[10px] tracking-[2px] text-cream shadow-[var(--shadow-hard-sm)]">
                {events.length} ESPECIAL{events.length > 1 ? "ES" : ""}
              </span>
            )}
          </div>

          {/* Normal shift */}
          <div className="flex items-center gap-2">
            <span className="font-display text-[10px] tracking-[2px] text-muted-ink">
              TURNO
            </span>
            {normalWorkers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                {normalWorkers.map((w) => (
                  <WorkerAvatar key={w.id} worker={w} size="sm" />
                ))}
              </div>
            ) : (
              <span className="font-sans text-sm font-bold text-muted-ink">
                Sin asignar
              </span>
            )}
          </div>
        </div>

        {/* Manage button */}
        <button
          type="button"
          onClick={onManage}
          aria-label={`Planificar ${WEEKDAYS_SHORT[date.getDay()]} ${date.getDate()}`}
          className="flex w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-ink bg-warm shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#171717]"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={3} />
        </button>
      </div>

      {/* Special events */}
      {events.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-t-[3px] border-dotted border-ink/20 pt-3">
          {events.map((ev) => {
            const Icon = EVENT_ICON[ev.type]
            const evWorkers = ev.workerIds
              .map((id) => workersById.get(id))
              .filter((w): w is Worker => Boolean(w))
            return (
              <div
                key={ev.id}
                className="flex items-center gap-2.5 rounded-[14px] border-[3px] border-ink bg-warm px-3 py-2 shadow-[var(--shadow-hard-sm)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-ink bg-pink text-cream">
                  <Icon className="h-4 w-4" strokeWidth={2.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm tracking-[-0.3px] text-ink">
                    {ev.title}
                  </p>
                  <p className="font-sans text-xs font-bold text-muted-ink">
                    {EVENT_LABELS[ev.type]}
                    {ev.time ? ` · ${ev.time}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 -space-x-1.5">
                  {evWorkers.length > 0 ? (
                    evWorkers.map((w) => (
                      <WorkerAvatar key={w.id} worker={w} size="sm" />
                    ))
                  ) : (
                    <span className="font-sans text-xs font-bold text-muted-ink">
                      +extra
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!hasPlan && !isOpen && (
        <p className="sr-only">Día sin planificación</p>
      )}
    </article>
  )
}
