import "../css/RegisterPage.css"
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const RegisterPage = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      await register({ name, email, password });

      navigate('/profile');

      // återställer formuläret
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ett okänt fel uppstod vid registrering.");
      }
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registera dig</h2>

        <form onSubmit={handleSubmit}>
          {error && (<div className="error-message">
            {error}
          </div>)}

          <div className="form-group">
            <input autoComplete="off" className="input" type="name" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            <label className="user-label" htmlFor="name">Namn</label>
          </div>

          <div className="form-group">
            <input autoComplete="off" className="input" type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="user-label" htmlFor="email">E-postadress</label>
          </div>

          <div className="form-group">
            <input autoComplete="off" className="input" type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label className="user-label" htmlFor="password">Lösenord</label>
          </div>

          <button type="submit" className="submitBtn"><strong>Registera dig</strong></button>

          <p>Har du redan ett konto? <NavLink to="/login">Logga in</NavLink></p>

        </form>
      </div>
    </div>
  )
}

export default RegisterPage