"use client"

import { BiLeftArrow, BiLogOut } from "react-icons/bi"
import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"

function Navbar() {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <div className="w-full fixed top-0 bg-transparent border-b border-gray-700 text-white p-4 z-50">
      <nav className="max-w-7xl flex justify-between items-center mx-auto">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <BiLeftArrow size={24} />
              Back
            </Link>

            <h2>
              Signed in as <b>{user?.fullName}</b>
            </h2>
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-4">
            <BiLeftArrow size={24} />
            Back
          </Link>
        )}

        {user && (
          <button
            className="px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
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
