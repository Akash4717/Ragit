import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import supabaseClient from "../lib/supabase";
import AnimatedBackground from "../components/AnimatedBackground";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Signup still goes through backend
        await api.post("/auth/signup", {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
        toast.success("Account created! Please login.");
        setIsSignup(false);
      } else {
        // ✅ Login directly via Supabase client
        // This makes Supabase save session to localStorage automatically
        // so it persists on page refresh
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw new Error(error.message);

        login(data.session);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground variant="particles" />
      
      {/* Home button */}
<div style={{ position: "fixed", top: "20px", left: "24px", zIndex: 50 }}>
  <button
    onClick={() => navigate("/")}
    style={{
      display: "flex", alignItems: "center", gap: "8px",
      background: "rgba(29,185,84,0.08)",
      border: "1px solid rgba(29,185,84,0.25)",
      borderRadius: "8px", padding: "8px 14px",
      color: "#1DB954", fontSize: "12px", fontWeight: "700",
      fontFamily: "'Space Mono', monospace",
      cursor: "pointer", transition: "all 0.2s",
      backdropFilter: "blur(8px)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(29,185,84,0.15)";
      e.currentTarget.style.borderColor = "#1DB954";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(29,185,84,0.08)";
      e.currentTarget.style.borderColor = "rgba(29,185,84,0.25)";
    }}
  >
    ← home
  </button>
</div>
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <Card className="w-full max-w-md relative z-10 animate-scale-in backdrop-blur-glass glow-border border-primary/20">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="relative bg-primary/20 backdrop-blur-glass border border-primary/30 rounded-full p-3">
                <svg
                  className="h-10 w-10 text-primary animate-pulse-slow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold">
            <span className="text-white">RAG</span>
            <span className="gradient-text">IT</span>
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {isSignup
              ? "Create your developer account"
              : "Welcome back! Please login to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="text-sm font-medium text-white">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-white placeholder:text-muted-foreground focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="dev@company.com"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-input border-border text-white placeholder:text-muted-foreground focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="bg-input border-border text-white placeholder:text-muted-foreground focus:border-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full hover-lift hover-glow mt-6"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner w-4! h-4! border-2!"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isSignup ? "Create Account" : "Login"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setIsSignup(!isSignup)}
            variant="outline"
            className="w-full hover-lift border-primary/30 hover:border-primary hover:bg-primary hover:text-black"
          >
            {isSignup ? "Login Instead" : "Create Account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;