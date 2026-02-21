import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session exists on app load
    const stored = localStorage.getItem("ragit_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      setUser(parsed.user);
    }
    setLoading(false);

    // Listen for auth state changes from Supabase
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          localStorage.setItem("ragit_session", JSON.stringify(session));
        } else {
          setSession(null);
          setUser(null);
          localStorage.removeItem("ragit_session");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = (sessionData) => {
    setSession(sessionData);
    setUser(sessionData.user);
    localStorage.setItem("ragit_session", JSON.stringify(sessionData));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.removeItem("ragit_session");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default AuthContext;