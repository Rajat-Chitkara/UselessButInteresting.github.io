import { NextResponse } from "next/server"
import { submitFact } from "@/lib/supabase"
import type { SubmittedFact } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the submission
    if (!body.text || !body.category || !body.submittedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fact: SubmittedFact = {
      text: body.text,
      category: body.category,
      submittedBy: body.submittedBy,
      approved: false,
      createdAt: new Date().toISOString(),
      source: body.source,
    }

    const result = await submitFact(fact)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error submitting fact:", error)
    return NextResponse.json({ error: "Failed to submit fact" }, { status: 500 })
  }
}

