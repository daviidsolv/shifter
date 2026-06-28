"use client"

import { useState } from "react"
import { Cake, CalendarCheck, Plus, Sparkles, Trash2 } from "lucide-react"
import {
  EVENT_LABELS,
  WEEKDAYS_LONG,
  uid,
  type DaySchedule,
  type EventType,
  type SpecialEvent,
  type Worker,
} from "@/lib/planner"
import { cn } from "@/lib/utils"
import { Sheet } from "./sheet"
import { WorkerChips } from "./worker-chips"

const EVENT_OPTIONS: { type: EventType; icon: typeof Cake; short: string }[] = [
  { type: "reserva", icon: CalendarCheck, short: "RESERVA" },
  { type: "cumple", icon: Cake, short: "CUMPLE" },
  { type: "otro", icon: Sparkles, short: "OTRO" },
]

export function ManageSheet({
  open,
  date,
  venueName,
  schedule,
  workers,
  onClose,
  onSave,
}: {
  open: boolean
  date: Date | null
  venueName: string
  schedule: DaySchedule
  workers: Worker[]
  onClose: () => void
  onSave: (next: DaySchedule) => void
}) {
  const [normal, setNormal] = useState<string[]>(schedule.normal)
  const [events, setEvents] = useState<SpecialEvent[]>(schedule.events)

  // Draft for new event
  const [showForm, setShowForm] = useState(false)
  const [evTitle, setEvTitle] = useState("")
  const [evType, setEvType] = useState<EventType>("reserva")
  const [evTime, setEvTime] = useState("")
  const [evWorkers, setEvWorkers] = useState<string[]>([])

  if (!date) return null

  const toggleNormal = (id: string) =>
    setNormal((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const toggleEvWorker = (id: string) =>
    setEvWorkers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const resetForm = () => {
    setEvTitle("")
    setEvType("reserva")
    setEvTime("")
    setEvWorkers([])
    setShowForm(false)
  }

  const addEvent = () => {
    const title = evTitle.trim() || EVENT_LABELS[evType]
    setEvents((prev) => [
      ...prev,
      { id: uid(), title, type: evType, time: evTime, workerIds: evWorkers },
    ])
    resetForm()
  }

  const removeEvent = (id: string) =>
    setEvents((prev) => prev.filter((e) => e.id !== id))

  const handleSave = () => {
    onSave({ normal, events })
  }

  const title = `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()}`

  return (
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={handleSave}
          className="h-14 w-full rounded-[18px] border-[3px] border-ink bg-red font-display text-base uppercase tracking-[2px] text-ink shadow-[var(--shadow-hard-md)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#171717]"
        >
          Guardar planificación
        </button>
      }
    >
      <p className="mb-4 font-display text-[10px] tracking-[3px] text-muted-ink">
        {venueName.toUpperCase()}
      </p>

      {/* Normal shift */}
      <section className="rounded-[18px] border-[3px] border-ink bg-cream p-3.5 shadow-[var(--shadow-hard-sm)]">
        <h3 className="mb-3 font-display text-sm tracking-[1px] text-ink">
          TURNO NORMAL
        </h3>
        <WorkerChips workers={workers} selected={normal} onToggle={toggleNormal} />
      </section>

      {/* Special events */}
      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm tracking-[1px] text-ink">
            EVENTOS ESPECIALES
          </h3>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1 rounded-[12px] border-[3px] border-ink bg-pink px-3 py-1 font-display text-[11px] tracking-[1px] text-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> AÑADIR
            </button>
          )}
        </div>

        {events.length === 0 && !showForm && (
          <p className="rounded-[14px] border-[3px] border-dashed border-ink/30 bg-cream/60 px-3 py-4 text-center font-sans text-sm font-bold text-muted-ink">
            Sin reservas ni cumpleaños este día
          </p>
        )}

        <div className="flex flex-col gap-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 rounded-[14px] border-[3px] border-ink bg-warm px-3 py-2 shadow-[var(--shadow-hard-sm)]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-ink">
                  {ev.title}
                </p>
                <p className="font-sans text-xs font-bold text-muted-ink">
                  {EVENT_LABELS[ev.type]}
                  {ev.time ? ` · ${ev.time}` : ""} · {ev.workerIds.length} extra
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEvent(ev.id)}
                aria-label="Eliminar evento"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[3px] border-ink bg-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2.75} />
              </button>
            </div>
          ))}
        </div>

        {/* New event form */}
        {showForm && (
          <div className="mt-3 rounded-[18px] border-[3px] border-ink bg-cream p-3.5 shadow-[var(--shadow-hard-sm)]">
            <label className="mb-1 block font-display text-[10px] tracking-[2px] text-muted-ink">
              NOMBRE
            </label>
            <input
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              placeholder="Cumple de Laura, mesa VIP..."
              className="mb-3 w-full rounded-[12px] border-[3px] border-ink bg-paper px-3 py-2 font-sans text-sm font-bold text-ink outline-none placeholder:text-muted-ink/70 focus:bg-warm/50"
            />

            <label className="mb-1 block font-display text-[10px] tracking-[2px] text-muted-ink">
              TIPO
            </label>
            <div className="mb-3 flex gap-2">
              {EVENT_OPTIONS.map(({ type, icon: Icon, short }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEvType(type)}
                  aria-pressed={evType === type}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[12px] border-[3px] border-ink px-1 py-2 font-display text-[10px] tracking-[1px] shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                    evType === type ? "bg-pink text-cream" : "bg-paper text-ink",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2.75} />
                  {short}
                </button>
              ))}
            </div>

            <label className="mb-1 block font-display text-[10px] tracking-[2px] text-muted-ink">
              HORA
            </label>
            <input
              type="time"
              value={evTime}
              onChange={(e) => setEvTime(e.target.value)}
              className="mb-3 w-full rounded-[12px] border-[3px] border-ink bg-paper px-3 py-2 font-sans text-sm font-bold text-ink outline-none focus:bg-warm/50"
            />

            <label className="mb-2 block font-display text-[10px] tracking-[2px] text-muted-ink">
              PERSONAL EXTRA
            </label>
            <WorkerChips
              workers={workers}
              selected={evWorkers}
              onToggle={toggleEvWorker}
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={addEvent}
                className="h-11 flex-1 rounded-[14px] border-[3px] border-ink bg-green font-display text-sm uppercase tracking-[1px] text-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Añadir evento
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-[14px] border-[3px] border-ink bg-cream px-4 font-display text-sm uppercase tracking-[1px] text-ink shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </Sheet>
  )
}
