"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Share2, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, Shuffle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
        // Fallback to initial facts if there's an error
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
          // Randomize the filtered facts
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
        // Fallback to initial facts if there's an error
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

  const getRandomFact = () => {
    if (!facts.length || facts.length === 1) return

    setIsAnimating(true)

    // Get a random fact that's different from the current one
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
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(`${fact.text} - UselessButInteresting`)
      alert("Fact copied to clipboard!")
    }
  }

  const bookmarkedFactsList = facts.filter((fact) => bookmarkedFacts.includes(fact.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">UselessButInteresting</h1>
          <p className="text-muted-foreground">Discover fascinating facts from around the world</p>
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
              // Use a more reliable way to navigate
              window.location.href = `${window.location.origin}/admin`
            }}
          >
            Admin
          </Button>
        </div>
      </header>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="submit">Submit</TabsTrigger>
          <TabsTrigger value="trivia">Trivia</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading facts...</span>
            </div>
          ) : currentFact ? (
            <Card className={`w-full transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Did you know?</span>
                  <Badge>{currentFact.category}</Badge>
                </CardTitle>
                <CardDescription>Fact #{currentFact.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl">{currentFact.text}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleLike(currentFact.id)}
                    className={likedFacts.includes(currentFact.id) ? "bg-green-100 dark:bg-green-900" : ""}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${likedFacts.includes(currentFact.id) ? "text-green-600 dark:text-green-400" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleDislike(currentFact.id)}
                    className={dislikedFacts.includes(currentFact.id) ? "bg-red-100 dark:bg-red-900" : ""}
                  >
                    <ThumbsDown
                      className={`h-4 w-4 ${dislikedFacts.includes(currentFact.id) ? "text-red-600 dark:text-red-400" : ""}`}
                    />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => shareFact()}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => toggleBookmark(currentFact.id)}>
                    {bookmarkedFacts.includes(currentFact.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button onClick={getRandomFact} className="group">
                  <Shuffle className="mr-2 h-4 w-4 group-hover:animate-spin" />
                  Next Fact
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p>No facts available for this category. Try another category.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facts.slice(0, 6).map((fact) => (
              <Card key={fact.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Fact #{fact.id}</CardTitle>
                    <Badge>{fact.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <p>{fact.text}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="px-2" onClick={() => toggleLike(fact.id)}>
                      <ThumbsUp
                        className={`h-4 w-4 mr-1 ${likedFacts.includes(fact.id) ? "text-green-600 dark:text-green-400" : ""}`}
                      />
                      <span className="text-xs">{likedFacts.includes(fact.id) ? "Liked" : "Like"}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="px-2" onClick={() => toggleBookmark(fact.id)}>
                      {bookmarkedFacts.includes(fact.id) ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-1 text-primary" />
                          <span className="text-xs">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-1" />
                          <span className="text-xs">Save</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarks">
          {bookmarkedFactsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedFactsList.map((fact) => (
                <Card key={fact.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Fact #{fact.id}</CardTitle>
                      <Badge>{fact.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <p>{fact.text}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => toggleLike(fact.id)}>
                        <ThumbsUp
                          className={`h-4 w-4 mr-1 ${likedFacts.includes(fact.id) ? "text-green-600 dark:text-green-400" : ""}`}
                        />
                        <span className="text-xs">{likedFacts.includes(fact.id) ? "Liked" : "Like"}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => toggleBookmark(fact.id)}>
                        <BookmarkCheck className="h-4 w-4 mr-1 text-primary" />
                        <span className="text-xs">Remove</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => shareFact(fact)}>
                        <Share2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">Share</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
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
  )
}

