import type { Fact, SubmittedFact } from "./types"

export const categories = [
  "Science",
  "History",
  "Geography",
  "Animals",
  "Space",
  "Technology",
  "Food",
  "Sports",
  "Anime", // Added Anime category
]

// Initial facts data
export const facts: Fact[] = [
  {
    id: "1",
    text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
    category: "Food",
  },
  {
    id: "2",
    text: "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to complete one orbit of the Sun.",
    category: "Space",
  },
  {
    id: "3",
    text: "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
    category: "History",
  },
  {
    id: "4",
    text: "Octopuses have three hearts. Two pump blood through the gills, while the third pumps it through the body.",
    category: "Animals",
  },
  {
    id: "5",
    text: "The average person will spend six months of their life waiting for red lights to turn green.",
    category: "Technology",
  },
  {
    id: "6",
    text: "The Great Barrier Reef is the largest living structure on Earth, stretching over 1,400 miles and visible from space.",
    category: "Geography",
  },
  {
    id: "7",
    text: "A bolt of lightning is five times hotter than the surface of the sun, reaching temperatures of about 30,000 kelvins (53,540 degrees Fahrenheit).",
    category: "Science",
  },
  {
    id: "8",
    text: "The world's oldest known living tree is a Great Basin Bristlecone Pine in the White Mountains of California, estimated to be over 5,000 years old.",
    category: "Science",
  },
  {
    id: "9",
    text: "Cows have best friends and can become stressed when they are separated from them.",
    category: "Animals",
  },
  {
    id: "10",
    text: "The first computer programmer was a woman named Ada Lovelace, who wrote the first algorithm for Charles Babbage's Analytical Engine in the 1840s.",
    category: "Technology",
  },
  {
    id: "11",
    text: "The shortest commercial flight in the world is between the Scottish islands of Westray and Papa Westray, with a flight time of just under two minutes.",
    category: "Geography",
  },
  {
    id: "12",
    text: "A group of flamingos is called a 'flamboyance'.",
    category: "Animals",
  },
  {
    id: "13",
    text: "The human nose can detect over 1 trillion different scents.",
    category: "Science",
  },
  {
    id: "14",
    text: "The world's largest desert is Antarctica, which is classified as a desert because it receives very little precipitation.",
    category: "Geography",
  },
  {
    id: "15",
    text: "The first Olympic Games were held in 776 BCE in Olympia, Greece, and featured only one event: a foot race called the 'stade'.",
    category: "Sports",
  },
  {
    id: "16",
    text: "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
    category: "Science",
  },
  {
    id: "17",
    text: "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron.",
    category: "Science",
  },
  {
    id: "18",
    text: "Bananas are berries, but strawberries are not.",
    category: "Food",
  },
  {
    id: "19",
    text: "The average cloud weighs about 1.1 million pounds due to the weight of the water droplets it contains.",
    category: "Science",
  },
  {
    id: "20",
    text: "The first message sent over the internet was 'LO'. The intended message was 'LOGIN', but the system crashed after the first two letters.",
    category: "Technology",
  },
  // Added anime facts
  {
    id: "21",
    text: "The highest-grossing anime film of all time is 'Demon Slayer: Mugen Train', which surpassed Studio Ghibli's 'Spirited Away' in 2020.",
    category: "Anime",
  },
  {
    id: "22",
    text: "One Piece holds the Guinness World Record for 'the most copies published for the same comic book series by a single author'.",
    category: "Anime",
  },
  {
    id: "23",
    text: "The term 'anime' comes from the English word 'animation' and is used in Japan to refer to all animation, not just Japanese-style animation.",
    category: "Anime",
  },
  {
    id: "24",
    text: "Studio Ghibli's films have won numerous awards, including an Academy Award for 'Spirited Away' in 2003 for Best Animated Feature.",
    category: "Anime",
  },
  {
    id: "25",
    text: "The popular anime 'Pokémon' has been running continuously since 1997, making it one of the longest-running anime series in history.",
    category: "Anime",
  },
]

// Local storage keys
export const STORAGE_KEYS = {
  FACTS: "facts_data",
  SUBMITTED_FACTS: "submitted_facts",
  BOOKMARKS: "bookmarkedFacts",
  LIKED: "likedFacts",
  DISLIKED: "dislikedFacts",
  ADMIN_PASSWORD: "admin_password",
}

// Default admin password (you should change this)
export const DEFAULT_ADMIN_PASSWORD = "JR56OPsh#"

// Helper functions for localStorage
export const getStoredFacts = (): Fact[] => {
  if (typeof window === "undefined") return facts

  try {
    const storedFacts = localStorage.getItem(STORAGE_KEYS.FACTS)
    if (!storedFacts) {
      localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(facts))
      return facts
    }
    return JSON.parse(storedFacts)
  } catch (error) {
    console.error("Error accessing localStorage:", error)
    return facts
  }
}

export const getRandomFacts = (): Fact[] => {
  const allFacts = getStoredFacts()
  // Create a copy and shuffle it
  return [...allFacts].sort(() => Math.random() - 0.5)
}

export const getStoredSubmissions = (): SubmittedFact[] => {
  if (typeof window === "undefined") return []

  try {
    const storedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMITTED_FACTS)
    if (!storedSubmissions) {
      localStorage.setItem(STORAGE_KEYS.SUBMITTED_FACTS, JSON.stringify([]))
      return []
    }
    return JSON.parse(storedSubmissions)
  } catch (error) {
    console.error("Error accessing localStorage:", error)
    return []
  }
}

export const submitFact = (fact: Omit<SubmittedFact, "id" | "approved" | "createdAt">): SubmittedFact => {
  const submissions = getStoredSubmissions()

  const newFact: SubmittedFact = {
    id: Date.now().toString(),
    ...fact,
    approved: false,
    createdAt: new Date().toISOString(),
  }

  const updatedSubmissions = [...submissions, newFact]
  localStorage.setItem(STORAGE_KEYS.SUBMITTED_FACTS, JSON.stringify(updatedSubmissions))

  return newFact
}

export const approveFact = (factId: string): void => {
  const submissions = getStoredSubmissions()
  const allFacts = getStoredFacts()

  const factToApprove = submissions.find((f) => f.id === factId)
  if (!factToApprove) return

  // Add to facts
  const newFact: Fact = {
    id: Date.now().toString(),
    text: factToApprove.text,
    category: factToApprove.category,
    submittedBy: factToApprove.submittedBy,
    approved: true,
    createdAt: factToApprove.createdAt,
  }

  const updatedFacts = [...allFacts, newFact]
  localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(updatedFacts))

  // Remove from submissions
  const updatedSubmissions = submissions.filter((f) => f.id !== factId)
  localStorage.setItem(STORAGE_KEYS.SUBMITTED_FACTS, JSON.stringify(updatedSubmissions))
}

export const rejectFact = (factId: string): void => {
  const submissions = getStoredSubmissions()
  const updatedSubmissions = submissions.filter((f) => f.id !== factId)
  localStorage.setItem(STORAGE_KEYS.SUBMITTED_FACTS, JSON.stringify(updatedSubmissions))
}

export const addFact = (fact: Omit<Fact, "id" | "approved" | "createdAt">): Fact => {
  const allFacts = getStoredFacts()

  const newFact: Fact = {
    id: Date.now().toString(),
    ...fact,
    approved: true,
    createdAt: new Date().toISOString(),
  }

  const updatedFacts = [...allFacts, newFact]
  localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(updatedFacts))

  return newFact
}

export const updateFact = (factId: string, updates: Partial<Fact>): Fact => {
  const allFacts = getStoredFacts()

  const updatedFacts = allFacts.map((fact) => {
    if (fact.id === factId) {
      return { ...fact, ...updates }
    }
    return fact
  })

  localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(updatedFacts))

  return updatedFacts.find((f) => f.id === factId)!
}

export const deleteFact = (factId: string): void => {
  const allFacts = getStoredFacts()
  const updatedFacts = allFacts.filter((f) => f.id !== factId)
  localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(updatedFacts))
}

export const getFactsByCategory = (category: string): Fact[] => {
  const allFacts = getStoredFacts()
  return allFacts.filter((f) => f.category === category)
}

export const checkAdminPassword = (password: string): boolean => {
  try {
    const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD
    return password === storedPassword
  } catch (error) {
    console.error("Error checking admin password:", error)
    // Fallback to default password if localStorage fails
    return password === DEFAULT_ADMIN_PASSWORD
  }
}

export const setAdminPassword = (password: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password)
  } catch (error) {
    console.error("Error setting admin password:", error)
  }
}

