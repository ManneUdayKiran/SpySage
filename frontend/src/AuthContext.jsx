import React, { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile when token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const userData = await getProfile(token);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // If token is invalid, clear it
          if (error.response?.status === 401) {
            setToken(null);
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [token, user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUser(null); // Clear user data when token is removed
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
