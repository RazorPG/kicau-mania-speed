import Footer from "@/components/sections/Footer"
import Navbar from "@/components/sections/Navbar"
import { auth } from "@clerk/nextjs/server"

type Props = {
  children: React.ReactNode
}

async function Home({ children }: Props) {
  const { userId } = await auth()

  return (
    <>
      {userId && <Navbar />}
      {children}
      <Footer />
    </>
  )
}

export default Home
