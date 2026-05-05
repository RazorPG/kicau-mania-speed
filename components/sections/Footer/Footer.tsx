import React from "react"

function Footer() {
  return (
    <footer className="flex items-center justify-center w-full p-4 text-white bg-transparent border-t border-gray-700 text-sm md:text-base">
      <p>
        &copy; {new Date().getFullYear()} Kicau Mania Speed. All rights reserved{" "}
        <a
          href="https://github.com/razorpg"
          className="text-blue-400 hover:text-blue-300"
          target="_blank"
        >
          RazorPG
        </a>
        .
      </p>
    </footer>
  )
}

export default Footer
