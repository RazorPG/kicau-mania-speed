import Link from "next/link"

function Navbar() {
  return (
    <div className="w-full bg-transparent border-b border-gray-700 text-white p-4">
      <nav
        className="max-w-7xl flex justify-between items-center mx-auto
      "
      >
        <h2 className="mr-4">
          Signed in as <b>John Doe</b>
        </h2>
        <ul className="flex space-x-4">
          <li>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              Logout
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar
