"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-[430px] flex-col rounded-t-[24px] border-[3px] border-ink bg-paper shadow-[var(--shadow-hard-lg)] sm:rounded-[24px]">
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-dotted border-ink/20 p-4">
          <h2 className="font-display text-lg tracking-[-0.3px] text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border-[3px] border-ink bg-cream shadow-[var(--shadow-hard-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="border-t-[3px] border-dotted border-ink/20 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
