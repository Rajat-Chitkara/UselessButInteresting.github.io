import type { Metadata } from "next"
import AdminDashboard from "@/components/admin/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | UselessButInteresting",
  description: "Manage facts and submissions",
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  )
}