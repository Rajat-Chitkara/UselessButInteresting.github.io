"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogOut, CheckCircle, XCircle, Users, FileText, TrendingUp, Eye } from "lucide-react"
import {
  getStoredSubmissions,
  approveFact,
  rejectFact,
  checkAdminPassword,
  setAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
  getStoredFacts,
} from "@/lib/data"
import type { SubmittedFact } from "@/lib/types"
import FactEditor from "./fact-editor"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [pendingFacts, setPendingFacts] = useState<SubmittedFact[]>([])
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({})
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin_password")) {
      localStorage.setItem("admin_password", DEFAULT_ADMIN_PASSWORD)
    }
    setIsLoading(false)
  }, [])

  // Load pending facts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPendingFacts()
    }
  }, [isAuthenticated])

  const loadPendingFacts = () => {
    try {
      const submissions = getStoredSubmissions()
      setPendingFacts(submissions)
    } catch (error) {
      console.error("Error loading pending facts:", error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    try {
      const isValid = checkAdminPassword(password)

      if (isValid) {
        setIsAuthenticated(true)
      } else {
        throw new Error("Invalid password")
      }
    } catch (error: any) {
      setLoginError(error.message || "Failed to login")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    window.location.href = "/"
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setLoginError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setLoginError("Password must be at least 6 characters")
      return
    }

    setAdminPassword(newPassword)
    setShowChangePassword(false)
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleApproveFact = (factId: string) => {
    setIsProcessing((prev) => ({ ...prev, [factId]: true }))
    try {
      approveFact(factId)
      setPendingFacts(pendingFacts.filter((fact) => fact.id !== factId))
    } catch (error) {
      console.error("Error approving fact:", error)
      alert("Failed to approve fact")
    } finally {
      setIsProcessing((prev) => ({ ...prev, [factId]: false }))
    }
  }

  const handleRejectFact = (factId: string) => {
    setIsProcessing((prev) => ({ ...prev, [factId]: true }))
    try {
      rejectFact(factId)
      setPendingFacts(pendingFacts.filter((fact) => fact.id !== factId))
    } catch (error) {
      console.error("Error rejecting fact:", error)
      alert("Failed to reject fact")
    } finally {
      setIsProcessing((prev) => ({ ...prev, [factId]: false }))
    }
  }

  // Get stats
  const totalFacts = getStoredFacts().length
  const pendingCount = pendingFacts.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-lg">
              Login to manage facts and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showChangePassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {loginError && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowChangePassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    Save Password
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Login
                </Button>
                <div className="text-center">
                  <Button type="button" variant="link" onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="bg-white/50 hover:bg-white/80">
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout} className="bg-white/50 hover:bg-white/80">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Facts</p>
                  <p className="text-3xl font-bold">{totalFacts}</p>
                </div>
                <FileText className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending Review</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <Users className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Approval Rate</p>
                  <p className="text-3xl font-bold">
                    {totalFacts > 0 ? Math.round((totalFacts / (totalFacts + pendingCount)) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="pending" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Pending Submissions ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Manage Facts
            </TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Add New Fact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Pending Fact Submissions</CardTitle>
                <CardDescription className="text-lg">
                  Review and approve or reject user-submitted facts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingFacts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <p className="text-xl font-semibold mb-2">All caught up!</p>
                    <p className="text-gray-600 dark:text-gray-300">No pending submissions to review</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingFacts.map((fact) => (
                      <div key={fact.id} className="bg-white/50 dark:bg-gray-700/50 border rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">{fact.category}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Submitted by <span className="font-medium">{fact.submittedBy}</span> on{" "}
                              {new Date(fact.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApproveFact(fact.id)}
                              disabled={isProcessing[fact.id]}
                            >
                              {isProcessing[fact.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectFact(fact.id)}
                              disabled={isProcessing[fact.id]}
                            >
                              {isProcessing[fact.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">{fact.text}</p>
                        {fact.source && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Source:{" "}
                            <a
                              href={fact.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 hover:underline"
                            >
                              {fact.source}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <FactEditor />
          </TabsContent>

          <TabsContent value="add">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Add New Fact</CardTitle>
                <CardDescription className="text-lg">
                  Create a new fact to add to the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FactEditor isAddMode />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}