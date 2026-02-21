import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/layout/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data.products);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="nodes" />
      
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your <span className="gradient-text">Chatbots</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your KT chatbots and embed them into your internal tools
            </p>
          </div>
          <Button 
            onClick={() => navigate("/products/create")}
            className="hover-lift hover-glow whitespace-nowrap"
            size="lg"
          >
            <span className="text-lg">+</span> New Chatbot
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="spinner mb-4"></div>
            <p className="text-muted-foreground">Loading your chatbots...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 animate-scale-in">
            <div className="mb-8 animate-float">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-glass border border-primary/20">
                <svg
                  className="h-16 w-16 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No chatbots yet</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Create your first KT chatbot to get started with knowledge transfer automation
            </p>
            <Button
              onClick={() => navigate("/products/create")}
              className="hover-lift hover-glow"
              size="lg"
            >
              Create Your First Chatbot
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="hover-lift hover-border-glow cursor-pointer stagger-animation group border-border/50 bg-card/50 backdrop-blur-glass"
                onClick={() => navigate(`/products/${product.id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg text-white group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <Badge 
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30 whitespace-nowrap"
                    >
                      {product.language}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-10">
                    {product.description || "No description provided"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="hover-glow border-primary/30 hover:bg-primary hover:text-black text-xs"
                      >
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;