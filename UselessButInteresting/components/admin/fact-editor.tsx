"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Edit, Trash2, Plus, Check } from "lucide-react"
import { categories, getStoredFacts, addFact, updateFact, deleteFact } from "@/lib/data"
import type { Fact } from "@/lib/types"

const factSchema = z.object({
  text: z
    .string()
    .min(10, { message: "Fact must be at least 10 characters." })
    .max(500, { message: "Fact must be less than 500 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  source: z.string().optional(),
})

interface FactEditorProps {
  isAddMode?: boolean
}

export default function FactEditor({ isAddMode = false }: FactEditorProps) {
  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof factSchema>>({
    resolver: zodResolver(factSchema),
    defaultValues: {
      text: "",
      category: "",
      source: "",
    },
  })

  // Load facts on component mount
  useEffect(() => {
    if (!isAddMode) {
      loadFacts()
    } else {
      setIsLoading(false)
    }
  }, [isAddMode])

  // Update form when selected fact changes
  useEffect(() => {
    if (selectedFact) {
      form.reset({
        text: selectedFact.text,
        category: selectedFact.category,
        source: selectedFact.source || "",
      })
    }
  }, [selectedFact, form])

  const loadFacts = () => {
    setIsLoading(true)
    try {
      const loadedFacts = getStoredFacts()
      setFacts(loadedFacts)
    } catch (error) {
      console.error("Error loading facts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFacts = facts.filter(
    (fact) =>
      fact.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fact.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectFact = (fact: Fact) => {
    setSelectedFact(fact)
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setSelectedFact(null)
    form.reset({
      text: "",
      category: "",
      source: "",
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedFact(null)
  }

  const handleDelete = async (factId: string) => {
    if (!confirm("Are you sure you want to delete this fact?")) return

    setIsSubmitting(true)
    try {
      deleteFact(factId)
      setFacts(facts.filter((f) => f.id !== factId))
      setSelectedFact(null)
      setIsEditing(false)
    } catch (error) {
      console.error("Error deleting fact:", error)
      alert("Failed to delete fact")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof factSchema>) => {
    setIsSubmitting(true)
    try {
      if (isAddMode || !selectedFact) {
        // Add new fact
        const newFact = addFact({
          text: values.text,
          category: values.category,
          source: values.source,
          submittedBy: "Admin",
        })

        if (!isAddMode) {
          setFacts([newFact, ...facts])
        }

        form.reset({
          text: "",
          category: "",
          source: "",
        })

        alert("Fact added successfully!")
      } else {
        // Update existing fact
        const updatedFact = updateFact(selectedFact.id, {
          text: values.text,
          category: values.category,
          source: values.source,
        })

        setFacts(facts.map((f) => (f.id === updatedFact.id ? updatedFact : f)))
        setSelectedFact(null)
        setIsEditing(false)

        alert("Fact updated successfully!")
      }
    } catch (error) {
      console.error("Error saving fact:", error)
      alert("Failed to save fact")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAddMode) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fact Text</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the fact..." className="min-h-[120px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/source" {...field} />
                  </FormControl>
                  <FormDescription>Link to where this fact comes from.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Fact
              </>
            )}
          </Button>
        </form>
      </Form>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading facts...</span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fact Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter the fact..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/source" {...field} />
                      </FormControl>
                      <FormDescription>Link to where this fact comes from.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>

                <div className="flex space-x-2">
                  {selectedFact && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDelete(selectedFact.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  )}

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {selectedFact ? "Update" : "Add"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search facts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Fact
        </Button>
      </div>

      {filteredFacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No facts found. Try a different search term or add a new fact.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFacts.map((fact) => (
            <Card
              key={fact.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleSelectFact(fact)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{fact.category}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectFact(fact)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="line-clamp-2">{fact.text}</p>
                {fact.submittedBy && (
                  <p className="text-sm text-muted-foreground mt-2">Submitted by {fact.submittedBy}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

