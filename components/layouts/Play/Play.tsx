import Footer from "@/components/sections/Footer"
import Navbar from "@/components/sections/Navbar"
import React from "react"

type Props = {
  children: React.ReactNode
}

async function Play({ children }: Props) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default Play
