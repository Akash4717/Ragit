import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // ✅ Wait for Supabase to check session before redirecting
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "#1DB954",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "800",
          color: "#111", fontFamily: "'Space Mono', monospace",
          boxShadow: "0 0 20px rgba(29,185,84,0.4)",
          animation: "pulse-green 1.5s infinite",
        }}>R</div>
        <p style={{
          fontSize: "11px", color: "#555",
          fontFamily: "'Space Mono', monospace",
        }}>authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;