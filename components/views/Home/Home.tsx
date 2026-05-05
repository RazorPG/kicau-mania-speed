"use client"
import { useClerk } from "@clerk/nextjs"
import Link from "next/link"
import HighestScore from "./HighestScore"

function Home() {
  const { user } = useClerk()
  const { openSignIn } = useClerk()
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white">
        Kicau Mania{" "}
        <span className="italic text-blue-600 mx-1 uppercase">Speed</span>
      </h1>

      <div className="mt-8 grid gap-6 grid-cols-1 w-full max-w-sm">
        {!user && (
          <button
            className="bg-white hover:bg-blue-600 text-black hover:text-white font-bold py-2 px-4 rounded transition-all shadow-lg duration-300"
            onClick={() => openSignIn()}
          >
            Sign in or create an account
          </button>
        )}
        {user ? (
          <Link
            href="/play"
            className="bg-white hover:bg-blue-600 text-black hover:text-white font-bold py-2 px-4 rounded transition-all shadow-lg duration-300 text-center"
          >
            Start Game
          </Link>
        ) : (
          <Link
            href="/play"
            className="bg-transparent hover:bg-white hover:text-black border border-white text-white font-bold py-2 px-4 rounded text-center transition-all shadow-lg duration-300"
          >
            Play Anonymous
          </Link>
        )}

        <Link
          href="/leaderboard"
          className="bg-transparent hover:bg-white hover:text-black border border-white text-white font-bold py-2 px-4 rounded text-center transtion-all shadow-lg duration-300"
        >
          Leaderboard
        </Link>
        <HighestScore />
      </div>
    </main>
  )
}

export default Home
