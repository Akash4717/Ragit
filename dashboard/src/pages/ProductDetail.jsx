import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/layout/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import ResourceList from "../components/product/ResourceList";
import UploadResource from "../components/product/UploadResource";
import EmbedCode from "../components/product/EmbedCode";
import ChatPreview from "../components/product/ChatPreview";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    } catch (error) {
      toast.error("Failed to load product");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground variant="nodes" />
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 relative z-10 animate-fade-in">
          <div className="spinner mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground variant="nodes" />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
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
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-sm mb-4 max-w-2xl">
                {product.description || "No description provided"}
              </p>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 px-3 py-1"
                >
                  {product.language}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList className="backdrop-blur-glass border border-border/50 p-1 h-auto">
              <TabsTrigger 
                value="resources" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black px-6 py-2.5 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                KT Resources
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black px-6 py-2.5 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="test" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black px-6 py-2.5 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Test Chatbot
              </TabsTrigger>
              <TabsTrigger 
                value="embed" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black px-6 py-2.5 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Embed & API
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="animate-fade-in">
              <ResourceList
                resources={product.resources || []}
                productId={product.id}
                onRefresh={fetchProduct}
              />
            </TabsContent>

            <TabsContent value="upload" className="animate-fade-in">
              <UploadResource
                productId={product.id}
                onUploadSuccess={fetchProduct}
              />
            </TabsContent>

            <TabsContent value="test" className="animate-fade-in">
              <ChatPreview
                productId={product.id}
                productName={product.name}
              />
            </TabsContent>

            <TabsContent value="embed" className="animate-fade-in">
              <EmbedCode
                productId={product.id}
                apiKey={product.api_key}
                productName={product.name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;