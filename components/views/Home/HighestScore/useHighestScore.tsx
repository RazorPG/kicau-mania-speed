import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

function useHighestScore() {
  const { user, isLoaded } = useUser()
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      return
    }

    const fetchScore = async () => {
      try {
        const res = await fetch("/api/score")
        if (res.ok) {
          const data = await res.json()
          console.log("Fetched highest score:", data)
          setScore(data.score)
        }
      } catch (error) {
        console.error("Failed to fetch highest score", error)
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [user, isLoaded])

  return { score, loading, user, isLoaded }
}

export default useHighestScore
