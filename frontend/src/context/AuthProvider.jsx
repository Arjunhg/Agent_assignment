import { createContext, useState, useEffect, useContext } from "react";

// Create AuthContext
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    // Login function
    const login = (data) => {
        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for consuming the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
