import { initials, WORKER_BG, type Worker } from "@/lib/planner"
import { cn } from "@/lib/utils"

export function WorkerAvatar({
  worker,
  size = "md",
}: {
  worker: Worker
  size?: "sm" | "md"
}) {
  return (
    <span
      title={`${worker.name} · ${worker.role}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full border-[3px] border-ink font-display shadow-[var(--shadow-hard-sm)]",
        WORKER_BG[worker.color],
        size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs",
      )}
    >
      {initials(worker.name)}
    </span>
  )
}
