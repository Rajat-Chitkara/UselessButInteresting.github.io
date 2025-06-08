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
import { CheckCircle, Send, User, FileText, Tag, Link } from "lucide-react"
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
      submitFact({
        text: values.factText,
        category: values.category,
        submittedBy: values.name,
        source: values.source,
      })

      setIsSubmitted(true)

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
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Submit a Fact
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Share an interesting fact with the community. All submissions are reviewed before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300">
                Thank you for your submission!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                Your fact has been submitted for review. We appreciate your contribution to UselessButInteresting!
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          className="h-12 text-lg bg-white/50 dark:bg-gray-700/50 border-2 focus:border-blue-500"
                        />
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
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Your Fact
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share an interesting fact..." 
                          className="min-h-[150px] text-lg bg-white/50 dark:bg-gray-700/50 border-2 focus:border-blue-500 resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        Be concise and accurate. Facts should be verifiable and interesting.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Tag className="h-5 w-5 text-blue-500" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-lg bg-white/50 dark:bg-gray-700/50 border-2 focus:border-blue-500">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category} className="text-lg">
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
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Link className="h-5 w-5 text-blue-500" />
                          Source (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/source" 
                            {...field} 
                            className="h-12 text-lg bg-white/50 dark:bg-gray-700/50 border-2 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormDescription className="text-base">
                          Link to where you found this fact.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-105" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-5 w-5" />
                      Submit Fact
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}