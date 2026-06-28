import { ShiftPlanner } from "@/components/planner/shift-planner"
import { getPlannerState } from "@/lib/planner-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function Home() {
  const plannerState = await getPlannerState()

  return (
    <main className="min-h-screen">
      <ShiftPlanner initialState={plannerState} />
    </main>
  )
}
