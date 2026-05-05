"use client"

import useHighestScore from "./useHighestScore"

export default function HighestScore() {
  const { score, loading, user, isLoaded } = useHighestScore()

  if (!isLoaded || loading) return null
  if (!user || score === null) return null

  return (
    <div className="mt-4 p-4 border border-blue-600/50 bg-blue-900/20 rounded text-center shadow-lg">
      <p className="text-white text-sm uppercase tracking-wider mb-1 opacity-80">
        Highest Score
      </p>
      <p className="text-3xl font-bold text-blue-400">{score || 0}</p>
    </div>
  )
}
