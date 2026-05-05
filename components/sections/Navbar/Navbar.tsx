"use client"

import { BiLeftArrow, BiLogOut } from "react-icons/bi"
import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"

function Navbar() {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <div className="w-full bg-transparent border-b border-gray-700 text-white text-center p-2 md:p-4">
      <nav className="max-w-7xl flex justify-between items-center mx-auto text-sm md:text-base">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <BiLeftArrow size={20} />
              Back
            </Link>

            <h2>
              Signed in as <b>{user?.fullName}</b>
            </h2>
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-4">
            <BiLeftArrow size={20} />
            Back
          </Link>
        )}

        {user && (
          <button
            className="px-3 py-2 rounded hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            onClick={() => signOut()}
          >
            <BiLogOut size={20} />
            Logout
          </button>
        )}
      </nav>
    </div>
  )
}

export default Navbar
