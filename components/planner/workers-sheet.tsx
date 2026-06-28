"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  WORKER_BG,
  uid,
  type Worker,
  type WorkerColor,
} from "@/lib/planner"
import { cn } from "@/lib/utils"
import { Sheet } from "./sheet"
import { WorkerAvatar } from "./worker-avatar"

const COLORS: WorkerColor[] = ["red", "green", "pink", "gray", "warm"]

export function WorkersSheet({
  open,
  workers,
  onClose,
  onAdd,
  onRemove,
}: {
  open: boolean
  workers: Worker[]
  onClose: () => void
  onAdd: (worker: Worker) => void
  onRemove: (workerId: string) => void
}) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [color, setColor] = useState<WorkerColor>("red")

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({
      id: uid(),
      name: name.trim(),
      role: role.trim() || "Personal",
      color,
    })
    setName("")
    setRole("")
    setColor("red")
  }

  const handleRemove = (worker: Worker) => {
    const confirmed = window.confirm(
      `¿Eliminar a ${worker.name}? Se quitará de todos los turnos y eventos.`,
    )

    if (confirmed) onRemove(worker.id)
  }

  return (
    <Sheet
      open={open}
      title="Equipo"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border-[3px] border-ink bg-red font-display text-base uppercase tracking-[2px] text-ink shadow-[var(--shadow-hard-md)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#171717]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} /> Añadir trabajador
        </button>
      }
    >
      <section className="mb-4 flex flex-col gap-2">
        {workers.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-3 rounded-[14px] border-[3px] border-ink bg-cream px-3 py-2 shadow-[var(--shadow-hard-sm)]"
          >
            <WorkerAvatar worker={w} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm text-ink">{w.name}</p>
              <p className="font-sans text-xs font-bold text-muted-ink">
                {w.role}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(w)}
              aria-label={`Eliminar ${w.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-ink bg-paper shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.75} />
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-[18px] border-[3px] border-ink bg-warm/50 p-3.5 shadow-[var(--shadow-hard-sm)]">
        <h3 className="mb-3 font-display text-sm tracking-[1px] text-ink">
          NUEVO TRABAJADOR
        </h3>

        <label className="mb-1 block font-display text-[10px] tracking-[2px] text-muted-ink">
          NOMBRE
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre y apellido"
          className="mb-3 w-full rounded-[12px] border-[3px] border-ink bg-paper px-3 py-2 font-sans text-sm font-bold text-ink outline-none placeholder:text-muted-ink/70 focus:bg-cream"
        />

        <label className="mb-1 block font-display text-[10px] tracking-[2px] text-muted-ink">
          PUESTO
        </label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Barra, seguridad, DJ..."
          className="mb-3 w-full rounded-[12px] border-[3px] border-ink bg-paper px-3 py-2 font-sans text-sm font-bold text-ink outline-none placeholder:text-muted-ink/70 focus:bg-cream"
        />

        <label className="mb-2 block font-display text-[10px] tracking-[2px] text-muted-ink">
          COLOR
        </label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              className={cn(
                "h-10 w-10 rounded-full border-[3px] border-ink shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                WORKER_BG[c],
                color === c && "ring-2 ring-ink ring-offset-2 ring-offset-warm",
              )}
            />
          ))}
        </div>
      </section>
    </Sheet>
  )
}
