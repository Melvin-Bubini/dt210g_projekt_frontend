import AuthedHeader from "./AuthedHeader"
import { Outlet } from "react-router-dom"
import Footer from "./Footer"



const LayoutAccess = () => {
  return (
    <>
      <AuthedHeader />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

export default LayoutAccess