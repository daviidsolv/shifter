import { Bell, Users } from "lucide-react"

export function PlannerHeader({
  onOpenWorkers,
}: {
  onOpenWorkers: () => void
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="-rotate-2 select-none rounded-md border-[3px] border-ink bg-red px-3.5 py-1.5 font-display text-lg tracking-[2px] text-ink shadow-[var(--shadow-hard-sm)]">
        TURNOS
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Gestionar trabajadores"
          onClick={onOpenWorkers}
          className="flex h-12 w-12 items-center justify-center rounded-[15px] border-[3px] border-ink bg-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#171717]"
        >
          <Users className="h-6 w-6" strokeWidth={2.75} />
        </button>
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-12 w-12 items-center justify-center rounded-[15px] border-[3px] border-ink bg-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#171717]"
        >
          <Bell className="h-6 w-6" strokeWidth={2.75} />
        </button>
      </div>
    </header>
  )
}
