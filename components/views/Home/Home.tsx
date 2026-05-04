import Link from "next/link"
import React from "react"

function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white">
        Kicau Mania <span className="italic text-blue-600 mx-1">Speed</span>
      </h1>

      <div className="mt-8 grid gap-6 grid-cols-1 w-full max-w-sm">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign in or create an account
        </button>
        <Link
          href="/play"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          Play Anonymous
        </Link>
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Leaderboard
        </button>
      </div>
    </main>
  )
}

export default Home
