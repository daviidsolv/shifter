import { ShiftPlanner } from "@/components/planner/shift-planner"
import {
  getPlannerPersistenceMode,
  getPlannerState,
} from "@/lib/planner-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function Home() {
  const plannerState = await getPlannerState()
  const persistenceMode = getPlannerPersistenceMode()

  return (
    <main className="min-h-screen">
      <ShiftPlanner
        initialState={plannerState}
        persistenceMode={persistenceMode}
      />
    </main>
  )
}
