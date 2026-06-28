import { mkdir, readFile, rename, writeFile } from "fs/promises"
import path from "path"
import {
  defaultPlannerState,
  type DaySchedule,
  type EventType,
  type PlannerState,
  type Schedule,
  type SpecialEvent,
  type Worker,
  type WorkerColor,
} from "@/lib/planner"

type PersistedPlannerState = PlannerState & {
  version: 1
  updatedAt: string
}

const DATA_FILE = process.env.PLANNER_DATA_FILE
  ? path.resolve(process.env.PLANNER_DATA_FILE)
  : path.join(process.cwd(), ".data", "planner-state.json")

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

export async function getPlannerState(): Promise<PlannerState> {
  try {
    const raw = await readFile(DATA_FILE, "utf8")
    const state = normalizePlannerState(JSON.parse(raw))
    if (!state) {
      throw new Error(`Invalid planner state file: ${DATA_FILE}`)
    }
    return state
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      const initialState = defaultPlannerState()
      await savePlannerState(initialState)
      return initialState
    }

    throw error
  }
}

export async function savePlannerState(state: PlannerState): Promise<PlannerState> {
  const normalizedState = normalizePlannerState(state)
  if (!normalizedState) {
    throw new Error("Invalid planner state payload")
  }

  await mkdir(path.dirname(DATA_FILE), { recursive: true })

  const persisted: PersistedPlannerState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    ...normalizedState,
  }
  const tmpFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`

  await writeFile(tmpFile, `${JSON.stringify(persisted, null, 2)}\n`, "utf8")
  await rename(tmpFile, DATA_FILE)

  return normalizedState
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error
}
