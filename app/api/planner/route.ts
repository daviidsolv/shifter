import { NextResponse, type NextRequest } from "next/server"
import { normalizePlannerState } from "@/lib/planner"
import { getPlannerState, savePlannerState } from "@/lib/planner-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function GET() {
  try {
    const state = await getPlannerState()
    return NextResponse.json(state, { headers: NO_STORE })
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar la planificacion" },
      { status: 500, headers: NO_STORE },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json()
    const state = normalizePlannerState(payload)

    if (!state) {
      return NextResponse.json(
        { error: "Payload de planificacion invalido" },
        { status: 400, headers: NO_STORE },
      )
    }

    const savedState = await savePlannerState(state)
    return NextResponse.json(savedState, { headers: NO_STORE })
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la planificacion" },
      { status: 500, headers: NO_STORE },
    )
  }
}
