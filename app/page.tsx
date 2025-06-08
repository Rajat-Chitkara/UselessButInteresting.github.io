import type { Metadata } from "next"
import FactExplorer from "@/components/fact-explorer"

export const metadata: Metadata = {
  title: "UselessButInteresting | Explore Amazing Facts",
  description: "Discover, share, and interact with fascinating facts from around the world.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <FactExplorer />
    </div>
  )
}