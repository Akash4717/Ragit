import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Step 1: Get existing session from Supabase directly
    // This works even after page refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem("ragit_session", JSON.stringify(session));
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem("ragit_session");
      }
      setLoading(false);
    });

    // ✅ Step 2: Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export default AuthContext;