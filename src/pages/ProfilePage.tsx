import { useAuth } from "../context/AuthContext"
import "../css/ProfilePage.css"

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>Laddar...</p>;
  }
  return (
    <div className="container">
      <div className="card">
        <div className="card2">
          <h1>Välkommen, {user.name}!</h1>
          <p>E-post: {user.email}</p>
          <button className="logoutBtn" onClick={logout}>Logga ut</button>
        </div>
      </div>
    </div>

  )
}

export default ProfilePage