import Header from "./Header"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"

const LayoutNotAccess = () => {
    return (
        <>
            <Header />

            <main>
                <Outlet />
            </main>

            <Footer />
        </>
    )
}

export default LayoutNotAccess