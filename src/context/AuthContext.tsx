import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User, LoginCredentials, AuthContextType, AuthResponse, RegisterCredentials } from "../types/auth.types";

// skapa context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // logga in
    const login = async (credentials: LoginCredentials) => {

        try {
            const response = await fetch("http://localhost:4000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                throw new Error("Kunde inte logga in");
            }

            const data = await response.json() as AuthResponse;

            localStorage.setItem("token", data.token);

            setUser(data.user);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }

    }
    
    // logga ut
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    }

    // registrera användare
    const register = async (credentials: RegisterCredentials) => {
        try {
            const response = await fetch("http://localhost:4000/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                throw new Error("Kunde inte registrera");
            }

            const data = await response.json() as AuthResponse;

            localStorage.setItem("token", data.token);

            setUser(data.user);
        } catch (error) {
            console.log("Register error:", error);
            throw error;
        }
    }

    // validera token
    const checkToken = async () => {
        const token = localStorage.getItem("token");

        if(!token) {
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/users/validate", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
        }
    }

    useEffect(() => {
        checkToken();
    }, []);


    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () : AuthContextType => {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth måste användas inom en AuthProvider");
    }

    return context;
}