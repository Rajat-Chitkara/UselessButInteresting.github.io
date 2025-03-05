import { createClient } from "@supabase/supabase-js"
import type { Fact, SubmittedFact } from "./types"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Facts API
export async function fetchFacts() {
  const { data, error } = await supabase
    .from("facts")
    .select("*")
    .eq("approved", true)
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("Error fetching facts:", error)
    return []
  }

  return data as Fact[]
}

export async function fetchFactsByCategory(category: string) {
  const { data, error } = await supabase
    .from("facts")
    .select("*")
    .eq("approved", true)
    .eq("category", category)
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("Error fetching facts by category:", error)
    return []
  }

  return data as Fact[]
}

export async function submitFact(fact: SubmittedFact) {
  const { data, error } = await supabase.from("submitted_facts").insert([fact]).select()

  if (error) {
    console.error("Error submitting fact:", error)
    throw new Error("Failed to submit fact")
  }

  return data[0]
}

// Admin API
export async function fetchPendingFacts() {
  const { data, error } = await supabase
    .from("submitted_facts")
    .select("*")
    .eq("approved", false)
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("Error fetching pending facts:", error)
    return []
  }

  return data as SubmittedFact[]
}

export async function approveFact(factId: string) {
  // First get the fact details
  const { data: factData, error: fetchError } = await supabase
    .from("submitted_facts")
    .select("*")
    .eq("id", factId)
    .single()

  if (fetchError || !factData) {
    console.error("Error fetching fact to approve:", fetchError)
    throw new Error("Failed to approve fact")
  }

  // Start a transaction: add to facts table
  const { error: insertError } = await supabase.from("facts").insert([
    {
      text: factData.text,
      category: factData.category,
      submittedBy: factData.submittedBy,
      approved: true,
      createdAt: factData.createdAt,
    },
  ])

  if (insertError) {
    console.error("Error inserting approved fact:", insertError)
    throw new Error("Failed to approve fact")
  }

  // Update the submitted_facts record
  const { error: updateError } = await supabase.from("submitted_facts").update({ approved: true }).eq("id", factId)

  if (updateError) {
    console.error("Error updating submitted fact:", updateError)
    throw new Error("Failed to update submitted fact status")
  }

  return true
}

export async function rejectFact(factId: string) {
  const { error } = await supabase.from("submitted_facts").delete().eq("id", factId)

  if (error) {
    console.error("Error rejecting fact:", error)
    throw new Error("Failed to reject fact")
  }

  return true
}

export async function addFact(fact: Omit<Fact, "id">) {
  const { data, error } = await supabase
    .from("facts")
    .insert([
      {
        ...fact,
        approved: true,
        createdAt: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("Error adding fact:", error)
    throw new Error("Failed to add fact")
  }

  return data[0]
}

export async function updateFact(id: string, updates: Partial<Fact>) {
  const { data, error } = await supabase.from("facts").update(updates).eq("id", id).select()

  if (error) {
    console.error("Error updating fact:", error)
    throw new Error("Failed to update fact")
  }

  return data[0]
}

export async function deleteFact(id: string) {
  const { error } = await supabase.from("facts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting fact:", error)
    throw new Error("Failed to delete fact")
  }

  return true
}

