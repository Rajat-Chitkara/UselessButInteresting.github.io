"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { categories, submitFact } from "@/lib/data"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  factText: z
    .string()
    .min(10, { message: "Fact must be at least 10 characters." })
    .max(500, { message: "Fact must be less than 500 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  source: z.string().optional(),
})

export default function FactSubmissionForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      factText: "",
      category: "",
      source: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Submit the fact for admin approval
      submitFact({
        text: values.factText,
        category: values.category,
        submittedBy: values.name,
        source: values.source,
      })

      setIsSubmitted(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset()
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting fact:", error)
      alert("There was an error submitting your fact. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Fact</CardTitle>
        <CardDescription>
          Share an interesting fact with the community. All submissions are reviewed before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Thank you for your submission!</h3>
            <p className="text-muted-foreground max-w-md">
              Your fact has been submitted for review. We appreciate your contribution to YouWouldn&apos;tBelieve!
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="factText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Fact</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Share an interesting fact..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormDescription>Be concise and accurate. Facts should be verifiable.</FormDescription>
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
                      <FormDescription>Link to where you found this fact.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Fact"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

