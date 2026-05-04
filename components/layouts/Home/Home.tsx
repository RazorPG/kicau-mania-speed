import Footer from "@/components/sections/Footer"
import Navbar from "@/components/sections/Navbar"

type Props = {
  children: React.ReactNode
}

function Home({ children }: Props) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default Home
