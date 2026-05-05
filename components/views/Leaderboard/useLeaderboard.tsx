import { useState, useEffect } from "react"

type UserScore = {
  userId: string
  score: number
  name?: string
  imageUrl?: string
  email?: string
}

export function useLeaderboard() {
  const [data, setData] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard")
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const result = await res.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || "Unknown error")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return { data, loading, error }
}
