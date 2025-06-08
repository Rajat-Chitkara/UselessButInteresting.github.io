"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Share2, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, Shuffle, Loader2, Filter, Search, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FactSubmissionForm from "@/components/fact-submission-form"
import TriviaMode from "@/components/trivia-mode"
import { facts as initialFacts, categories, getFactsByCategory, getRandomFacts, STORAGE_KEYS } from "@/lib/data"
import type { Fact } from "@/lib/types"

export default function FactExplorer() {
  const [facts, setFacts] = useState<Fact[]>(initialFacts)
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)
  const [bookmarkedFacts, setBookmarkedFacts] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [likedFacts, setLikedFacts] = useState<string[]>([])
  const [dislikedFacts, setDislikedFacts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "random">("random")
  const { theme, setTheme } = useTheme()

  // Load facts from localStorage on component mount
  useEffect(() => {
    const loadFacts = () => {
      setIsLoading(true)
      try {
        const randomFacts = getRandomFacts()
        setFacts(randomFacts)
        setCurrentFact(randomFacts[0])
      } catch (error) {
        console.error("Error loading facts:", error)
        setCurrentFact(initialFacts[0])
      } finally {
        setIsLoading(false)
      }
    }

    loadFacts()
  }, [])

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (savedBookmarks) {
      setBookmarkedFacts(JSON.parse(savedBookmarks))
    }

    const savedLiked = localStorage.getItem(STORAGE_KEYS.LIKED)
    if (savedLiked) {
      setLikedFacts(JSON.parse(savedLiked))
    }

    const savedDisliked = localStorage.getItem(STORAGE_KEYS.DISLIKED)
    if (savedDisliked) {
      setDislikedFacts(JSON.parse(savedDisliked))
    }
  }, [])

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedFacts))
  }, [bookmarkedFacts])

  // Save likes/dislikes to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedFacts))
    localStorage.setItem(STORAGE_KEYS.DISLIKED, JSON.stringify(dislikedFacts))
  }, [likedFacts, dislikedFacts])

  // Load facts by category when category changes
  useEffect(() => {
    const loadFactsByCategory = () => {
      setIsLoading(true)
      try {
        let filteredFacts
        if (selectedCategory) {
          filteredFacts = getFactsByCategory(selectedCategory)
          filteredFacts = [...filteredFacts].sort(() => Math.random() - 0.5)
        } else {
          filteredFacts = getRandomFacts()
        }

        setFacts(filteredFacts)
        if (filteredFacts.length > 0) {
          setCurrentFact(filteredFacts[0])
        } else {
          setCurrentFact(null)
        }
      } catch (error) {
        console.error("Error loading facts by category:", error)
        const filteredFacts = selectedCategory
          ? initialFacts.filter((f) => f.category === selectedCategory)
          : initialFacts
        setFacts(filteredFacts)
        if (filteredFacts.length > 0) {
          setCurrentFact(filteredFacts[0])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadFactsByCategory()
  }, [selectedCategory])

  // Filter and sort facts
  const filteredAndSortedFacts = facts
    .filter((fact) => 
      fact.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fact.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        case "random":
        default:
          return Math.random() - 0.5
      }
    })

  const getRandomFact = () => {
    if (!facts.length || facts.length === 1) return

    setIsAnimating(true)

    let newFact
    do {
      newFact = facts[Math.floor(Math.random() * facts.length)]
    } while (facts.length > 1 && newFact.id === currentFact?.id)

    setTimeout(() => {
      setCurrentFact(newFact)
      setIsAnimating(false)
    }, 300)
  }

  const toggleBookmark = (factId: string) => {
    if (bookmarkedFacts.includes(factId)) {
      setBookmarkedFacts(bookmarkedFacts.filter((id) => id !== factId))
    } else {
      setBookmarkedFacts([...bookmarkedFacts, factId])
    }
  }

  const toggleLike = (factId: string) => {
    if (likedFacts.includes(factId)) {
      setLikedFacts(likedFacts.filter((id) => id !== factId))
    } else {
      setLikedFacts([...likedFacts, factId])
      setDislikedFacts(dislikedFacts.filter((id) => id !== factId))
    }
  }

  const toggleDislike = (factId: string) => {
    if (dislikedFacts.includes(factId)) {
      setDislikedFacts(dislikedFacts.filter((id) => id !== factId))
    } else {
      setDislikedFacts([...dislikedFacts, factId])
      setLikedFacts(likedFacts.filter((id) => id !== factId))
    }
  }

  const shareFact = (fact = currentFact) => {
    if (!fact) return

    if (navigator.share) {
      navigator
        .share({
          title: "Check out this interesting fact!",
          text: fact.text,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      navigator.clipboard.writeText(`${fact.text} - UselessButInteresting`)
      alert("Fact copied to clipboard!")
    }
  }

  const bookmarkedFactsList = facts.filter((fact) => bookmarkedFacts.includes(fact.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UselessButInteresting
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Discover fascinating facts from around the world
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <Label htmlFor="theme-toggle" className="sr-only">
                Toggle theme
              </Label>
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `${window.location.origin}/admin`
              }}
              className="bg-white/50 hover:bg-white/80 dark:bg-gray-700/50 dark:hover:bg-gray-700/80"
            >
              Admin
            </Button>
          </div>
        </header>

        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="explore" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Explore
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="submit" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Submit
            </TabsTrigger>
            <TabsTrigger value="trivia" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Trivia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            {/* Featured Fact Card */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading facts...</span>
              </div>
            ) : currentFact ? (
              <Card className={`w-full transition-all duration-500 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-800 shadow-xl ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">Featured Fact</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {currentFact.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Fact #{currentFact.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                    {currentFact.text}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLike(currentFact.id)}
                      className={`transition-all ${likedFacts.includes(currentFact.id) 
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300" 
                        : "hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {likedFacts.includes(currentFact.id) ? "Liked" : "Like"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDislike(currentFact.id)}
                      className={`transition-all ${dislikedFacts.includes(currentFact.id) 
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300" 
                        : "hover:bg-red-50 dark:hover:bg-red-900/20"}`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {dislikedFacts.includes(currentFact.id) ? "Disliked" : "Dislike"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareFact()}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBookmark(currentFact.id)}
                      className={`transition-all ${bookmarkedFacts.includes(currentFact.id) 
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300" 
                        : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"}`}
                    >
                      {bookmarkedFacts.includes(currentFact.id) ? (
                        <BookmarkCheck className="h-4 w-4 mr-1" />
                      ) : (
                        <Bookmark className="h-4 w-4 mr-1" />
                      )}
                      {bookmarkedFacts.includes(currentFact.id) ? "Saved" : "Save"}
                    </Button>
                  </div>
                  <Button 
                    onClick={getRandomFact} 
                    className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    <Shuffle className="mr-2 h-4 w-4 group-hover:animate-spin" />
                    Next Fact
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="py-8 text-center">
                  <p>No facts available for this category. Try another category.</p>
                </CardContent>
              </Card>
            )}

            {/* Filters and Controls */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search facts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-gray-700/50"
                    />
                  </div>
                </div>
                <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "random") => setSortBy(value)}>
                  <SelectTrigger className="w-full lg:w-48 bg-white/50 dark:bg-gray-700/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Facts Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredAndSortedFacts.slice(0, 12).map((fact) => (
                <Card 
                  key={fact.id} 
                  className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 ${
                    viewMode === "list" ? "flex-row" : ""
                  }`}
                >
                  <CardHeader className={`pb-2 ${viewMode === "list" ? "flex-shrink-0 w-1/4" : ""}`}>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">
                        Fact #{fact.id}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {fact.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className={`py-2 flex-grow ${viewMode === "list" ? "flex-1" : ""}`}>
                    <p className={viewMode === "list" ? "line-clamp-2" : ""}>{fact.text}</p>
                  </CardContent>
                  <CardFooter className={`pt-2 ${viewMode === "list" ? "flex-shrink-0 w-1/4" : ""}`}>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-2 h-8" 
                        onClick={() => toggleLike(fact.id)}
                      >
                        <ThumbsUp
                          className={`h-3 w-3 mr-1 ${likedFacts.includes(fact.id) ? "text-green-600 dark:text-green-400" : ""}`}
                        />
                        <span className="text-xs">{likedFacts.includes(fact.id) ? "Liked" : "Like"}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-2 h-8" 
                        onClick={() => toggleBookmark(fact.id)}
                      >
                        {bookmarkedFacts.includes(fact.id) ? (
                          <>
                            <BookmarkCheck className="h-3 w-3 mr-1 text-primary" />
                            <span className="text-xs">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-3 w-3 mr-1" />
                            <span className="text-xs">Save</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredAndSortedFacts.length === 0 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    No facts found matching your search criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            {bookmarkedFactsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedFactsList.map((fact) => (
                  <Card 
                    key={fact.id} 
                    className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold">
                          Fact #{fact.id}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {fact.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 flex-grow">
                      <p>{fact.text}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2" 
                          onClick={() => toggleLike(fact.id)}
                        >
                          <ThumbsUp
                            className={`h-4 w-4 mr-1 ${likedFacts.includes(fact.id) ? "text-green-600 dark:text-green-400" : ""}`}
                          />
                          <span className="text-xs">{likedFacts.includes(fact.id) ? "Liked" : "Like"}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2" 
                          onClick={() => toggleBookmark(fact.id)}
                        >
                          <BookmarkCheck className="h-4 w-4 mr-1 text-primary" />
                          <span className="text-xs">Remove</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2" 
                          onClick={() => shareFact(fact)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          <span className="text-xs">Share</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No bookmarks yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Save your favorite facts by clicking the bookmark icon while exploring.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submit">
            <FactSubmissionForm />
          </TabsContent>

          <TabsContent value="trivia">
            <TriviaMode facts={facts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}