import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [hovering, setHovering] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-glass border-b border-border px-6 py-4 flex items-center justify-between animate-fade-in">
      <Link 
        to="/dashboard" 
        className="text-2xl font-bold transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <span style={{ color: hovering ? 'var(--primary)' : 'white', transition: 'color 0.2s ease' }}>RAG</span>
        <span style={{ color: hovering ? 'var(--primary)' : 'oklch(0.58 0.197 145)', transition: 'color 0.2s ease' }}>IT</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {user?.email}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="hover-lift border-primary/30 hover:border-primary hover:bg-primary hover:text-green-500"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;