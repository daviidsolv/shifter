"use client"

import { Check } from "lucide-react"
import { initials, WORKER_BG, type Worker } from "@/lib/planner"
import { cn } from "@/lib/utils"

export function WorkerChips({
  workers,
  selected,
  onToggle,
}: {
  workers: Worker[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {workers.map((w) => {
        const isSelected = selected.includes(w.id)
        return (
          <button
            key={w.id}
            type="button"
            onClick={() => onToggle(w.id)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-2 rounded-full border-[3px] border-ink py-1 pl-1 pr-3 font-sans text-sm font-bold shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
              isSelected ? "bg-ink text-cream" : "bg-cream text-ink",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-ink font-display text-[10px]",
                WORKER_BG[w.color],
              )}
            >
              {isSelected ? (
                <Check className="h-4 w-4" strokeWidth={3.5} />
              ) : (
                initials(w.name)
              )}
            </span>
            <span className="leading-tight">
              {w.name.split(" ")[0]}
              <span className="block font-display text-[9px] tracking-[1px] opacity-70">
                {w.role.toUpperCase()}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
