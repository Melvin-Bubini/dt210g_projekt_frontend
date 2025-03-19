import { useState, useEffect } from "react"
import '../css/LoginPage.css';
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  //kontrollera användare
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

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
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
      general: ''
    });
    
    return !emailError && !passwordError;
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
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validera innan inloggning
    if (!validateForm()) {
      return;
    }
    
    setErrors({ email: '', password: '', general: '' });
    setIsLoading(true);

    try {
      await login({email, password});
      navigate("/profile");
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error instanceof Error) {
        // Försök identifiera om felet är relaterat till e-post eller lösenord
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('e-post') || errorMsg.includes('email') || errorMsg.includes('not found')) {
          setErrors(prev => ({ ...prev, email: error.message }));
        } else if (errorMsg.includes('lösenord') || errorMsg.includes('password') || errorMsg.includes('incorrect')) {
          setErrors(prev => ({ ...prev, password: error.message }));
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: "Ett okänt fel uppstod vid inloggning." }));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Logga in</h2>

        <form onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="error-message" role="alert">
              {errors.general}
            </div>
          )}

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
              autoComplete="current-password"
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
            <strong>{isLoading ? 'Loggar in...' : 'Logga in'}</strong>
          </button>

          <p>Har du inget konto? <NavLink to="/register">Skapa ett nytt konto</NavLink></p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage