import { useState, useEffect } from "react";
import "../css/RegisterPage.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register, user } = useAuth();

  // Kontrollera användare
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  // Validera namn
  const validateName = (name: string) => {
    if (!name) {
      return "Namn krävs";
    } else if (name.length > 100) {
      return "Namnet får inte vara längre än 100 tecken";
    }
    return '';
  };

  // Validera e-post
  const validateEmail = (email: string) => {
    email = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return "E-postadress krävs";
    } else if (!emailRegex.test(email)) {
      return "Ogiltig e-postadress";
    } else if (email.length > 100) {
      return "E-postadressen får inte vara längre än 100 tecken";
    }
    return '';
  };

  // Validera lösenord
  const validatePassword = (password: string) => {
    if (!password) {
      return "Lösenord krävs";
    } else if (password.length < 6) {
      return "Lösenordet måste vara minst 6 tecken";
    }
    return '';
  };

  // Validera hela formuläret
  const validateForm = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      general: ''
    });
    
    return !nameError && !emailError && !passwordError;
  };

  // Hantera ändringar i namnfält
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (!name) {
      setErrors(prev => ({
        ...prev,
        name: validateName(value)
      }));
    }
  };

  // Hantera ändringar i e-postfält
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors(prev => ({
      ...prev,
      email: validateEmail(value)
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors(prev => ({
      ...prev,
      password: validatePassword(value)
    }));
  };;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validera innan registrering
    if (!validateForm()) {
      return;
    }
    
    setErrors({ name: '', email: '', password: '', general: '' });
    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate("/profile");
      
      // Återställer formuläret
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error instanceof Error) {
        // Försök identifiera om felet är relaterat till något specifikt fält
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('namn') || errorMsg.includes('name')) {
          setErrors(prev => ({ ...prev, name: error.message }));
        } else if (errorMsg.includes('e-post') || errorMsg.includes('email')) {
          setErrors(prev => ({ ...prev, email: error.message }));
        } else if (errorMsg.includes('lösenord') || errorMsg.includes('password')) {
          setErrors(prev => ({ ...prev, password: error.message }));
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: "Ett okänt fel uppstod vid registrering." }));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrera dig</h2>

        <form onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="error-message" role="alert">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <input
              autoComplete="name"
              className={`input ${errors.name ? 'input-error' : ''}`}
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            <label className="user-label" htmlFor="name">Namn</label>
            {errors.name && (
              <div id="name-error" className="field-error-message" role="alert">
                {errors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <input
              autoComplete="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <label className="user-label" htmlFor="email">E-postadress</label>
            {errors.email && (
              <div id="email-error" className="field-error-message" role="alert">
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <input
              autoComplete="new-password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <label className="user-label" htmlFor="password">Lösenord</label>
            {errors.password && (
              <div id="password-error" className="field-error-message" role="alert">
                {errors.password}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={`submitBtn ${isLoading ? 'loading' : ''}`} 
            disabled={isLoading}
          >
            <strong>{isLoading ? 'Registrerar...' : 'Registrera dig'}</strong>
          </button>

          <p>Har du redan ett konto? <NavLink to="/login">Logga in</NavLink></p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage