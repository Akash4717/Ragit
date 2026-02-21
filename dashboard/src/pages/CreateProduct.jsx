import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/layout/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import { SUPPORTED_LOCALES } from "../lib/constants";

const CreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "en",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/products", form);
      toast.success("Chatbot created successfully!");
      navigate(`/products/${data.product.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create chatbot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground variant="particles" />
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 animate-fade-in-up">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground text-sm hover:text-primary transition-colors mb-4 flex items-center gap-1 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Create New <span className="gradient-text">Chatbot</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up a KT chatbot for your team. You can upload resources after creation.
          </p>
        </div>

        <Card className="glow-border animate-scale-in backdrop-blur-glass border-primary/20">
          <CardHeader className="border-b border-border/30 green-accent">
            <CardTitle className="text-2xl text-white">Chatbot Details</CardTitle>
            <CardDescription className="text-base">
              This chatbot will answer freshers' questions based on your KT materials
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-white">
                  Chatbot Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Acme Onboarding Bot"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-white placeholder:text-muted-foreground focus:border-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive name for your chatbot
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What does this chatbot help freshers with?"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="bg-input border-border text-white placeholder:text-muted-foreground focus:border-primary transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a brief description of your chatbot's purpose
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language" className="text-sm font-medium text-white">
                  Primary Language
                </Label>
                <select
                  id="language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-input text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                >
                  {SUPPORTED_LOCALES.map((locale) => (
                    <option key={locale.code} value={locale.code} className="bg-card">
                      {locale.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Lingo.dev will auto-detect and translate to any language regardless of this setting
                </p>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border/30">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="hover-lift hover-glow flex-1 sm:flex-initial"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner w-4! h-4! border-2!"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Chatbot
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="hover-lift border-primary/30 hover:border-primary"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateProduct;