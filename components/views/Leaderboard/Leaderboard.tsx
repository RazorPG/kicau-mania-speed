"use client"

import { useLeaderboard } from "./useLeaderboard"

function LeaderboardView() {
  const { data, loading, error } = useLeaderboard()
  console.log("Leaderboard data:", data)

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-white text-xl">Loading...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </main>
    )
  }

  // Top 3 separation
  const first = data[0]
  const second = data[1]
  const third = data[2]
  const rest = data.slice(3)

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4 w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-400">All Time Top Scores</p>
      </div>

      {data.length > 0 ? (
        <div className="w-full flex flex-col items-center">
          {/* Podium */}
          <div className="flex flex-row items-end justify-center gap-4 mb-8 w-full max-w-2xl mt-12">
            {/* Rank 2 */}
            {second && (
              <div className="flex flex-col items-center w-1/3">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full border-4 border-gray-400 overflow-hidden bg-blue-800 flex items-center justify-center">
                  {second.imageUrl ? (
                    <img
                      src={second.imageUrl}
                      alt={second.name || "User"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold uppercase">
                      {second.name ? second.name[0] : "U"}
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold truncate w-full text-center">
                  {second.name || "Player"}
                </p>

                <div className="mt-4 w-full bg-neutral-800 border border-neutral-700 rounded-t-lg pt-6 pb-4 flex flex-col items-center justify-start h-32 md:h-40">
                  <span className="text-gray-400 text-sm font-bold mb-1">
                    #2
                  </span>
                  <span className="text-xl md:text-2xl text-blue-400 font-bold">
                    {second.score.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {first && (
              <div className="flex flex-col items-center w-1/3 -mt-10">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mb-3 rounded-full border-4 border-yellow-400 overflow-hidden bg-blue-600 flex items-center justify-center">
                  {first.imageUrl ? (
                    <img
                      src={first.imageUrl}
                      alt={first.name || "User"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold uppercase">
                      {first.name ? first.name[0] : "U"}
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold truncate w-full text-center">
                  {first.name || "Player"}
                </p>

                <div className="mt-4 w-full bg-neutral-800 border border-yellow-500/50 rounded-t-lg pt-6 pb-4 flex flex-col items-center justify-start h-40 md:h-48">
                  <span className="text-yellow-500 text-lg font-bold mb-1">
                    #1
                  </span>
                  <span className="text-2xl md:text-3xl text-blue-400 font-bold">
                    {first.score.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {third && (
              <div className="flex flex-col items-center w-1/3">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full border-4 border-orange-600 overflow-hidden bg-blue-800 flex items-center justify-center">
                  {third.imageUrl ? (
                    <img
                      src={third.imageUrl}
                      alt={third.name || "User"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold uppercase">
                      {third.name ? third.name[0] : "U"}
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold truncate w-full text-center">
                  {third.name || "Player"}
                </p>

                <div className="mt-4 w-full bg-neutral-800 border border-neutral-700 rounded-t-lg pt-6 pb-4 flex flex-col items-center justify-start h-28 md:h-36">
                  <span className="text-orange-500 text-sm font-bold mb-1">
                    #3
                  </span>
                  <span className="text-xl md:text-2xl text-blue-400 font-bold">
                    {third.score.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* List Table */}
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl mt-4">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border-b border-neutral-800 text-gray-400 text-sm font-medium uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2 md:col-span-4 text-left">Player</div>
              <div className="col-span-1 text-right">Score</div>
            </div>

            <div className="flex flex-col">
              {rest.map((user, index) => (
                <div
                  key={user.userId}
                  className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border-b border-neutral-800 items-center hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="col-span-1 text-center text-gray-400 font-semibold">
                    {index + 4}
                  </div>
                  <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-800 flex shrink-0 items-center justify-center">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name || "User"}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs font-bold uppercase">
                          {user.name ? user.name[0] : "U"}
                        </span>
                      )}
                    </div>
                    <span className="text-white font-medium truncate">
                      {user.name || "Player"}
                    </span>
                  </div>
                  <div className="col-span-1 text-right text-blue-400 font-bold">
                    {user.score.toLocaleString()}
                  </div>
                </div>
              ))}

              {rest.length === 0 && (
                <div className="p-8 text-center text-gray-500 italic">
                  No other players found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 italic">No scores available yet.</div>
      )}
    </main>
  )
}

export default LeaderboardView
