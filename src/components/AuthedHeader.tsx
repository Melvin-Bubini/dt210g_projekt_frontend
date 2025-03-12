import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "../css/Header.css";

const AuthedHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <NavLink to="/" className="logo">
                    Bookshelf
                </NavLink>

                {/* Meny för stora skärmar */}
                <nav className="nav-links">
                    <NavLink to="/" className="nav-link">
                        Startsida
                    </NavLink>
                    <NavLink to="/profile" className="nav-link">
                        Profil
                    </NavLink>
                    <NavLink to="/Books" className="nav-link">
                        Böcker
                    </NavLink>
                    
                </nav>

                {/* Hamburgarmeny (syns endast på små skärmar) */}
                <button
                    className="menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Dropdown-meny för små skärmar */}
            {isMenuOpen && (
                <nav className="mobile-menu">
                    <NavLink to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        Startsida
                    </NavLink>
                    <NavLink to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        Profil
                    </NavLink>
                    <NavLink to="/Books" className="nav-link">
                        Böcker
                    </NavLink>
                </nav>
            )}
        </header>
    );
};

export default AuthedHeader;