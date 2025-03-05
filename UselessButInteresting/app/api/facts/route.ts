import { NextResponse } from "next/server"
import { fetchFacts, fetchFactsByCategory } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  try {
    if (category) {
      const facts = await fetchFactsByCategory(category)
      return NextResponse.json(facts)
    } else {
      const facts = await fetchFacts()
      return NextResponse.json(facts)
    }
  } catch (error) {
    console.error("Error fetching facts:", error)
    return NextResponse.json({ error: "Failed to fetch facts" }, { status: 500 })
  }
}

