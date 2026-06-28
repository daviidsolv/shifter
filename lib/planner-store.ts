import { mkdir, readFile, rename, writeFile } from "fs/promises"
import path from "path"
import {
  defaultPlannerState,
  normalizePlannerState,
  type PlannerPersistenceMode,
  type PlannerState,
} from "@/lib/planner"

type PersistedPlannerState = PlannerState & {
  version: 1
  updatedAt: string
}

const DATA_FILE = process.env.PLANNER_DATA_FILE
  ? path.resolve(process.env.PLANNER_DATA_FILE)
  : path.join(process.cwd(), ".data", "planner-state.json")

export function getPlannerPersistenceMode(): PlannerPersistenceMode {
  if (process.env.PLANNER_DATA_FILE) return "server"
  return process.env.VERCEL || process.env.VERCEL_ENV ? "browser" : "server"
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
      if (getPlannerPersistenceMode() === "server") {
        await savePlannerState(initialState)
      }
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

  if (getPlannerPersistenceMode() === "browser") {
    return normalizedState
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
