import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img 
            src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" 
            alt="ADIVINA" 
            className="h-12 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <Button 
            data-testid="back-to-home-button"
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK TO HOME
          </Button>
        </div>
      </header>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold uppercase mb-4">SHOP</h1>
          <p className="text-xl text-zinc-400">Premium sports equipment for elite performance</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-zinc-400">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                data-testid={`product-card-${product.id}`}
                className="bg-[#121212] border border-white/10 rounded-lg overflow-hidden hover-lift cursor-pointer group"
              >
                <div className="aspect-square bg-[#1E1E1E] overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold uppercase tracking-wide mb-2">{product.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#DFFF00]">${product.price}</span>
                    <Button 
                      data-testid={`add-to-cart-${product.id}`}
                      size="icon"
                      className="bg-[#DFFF00] text-black hover:bg-white rounded-full"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
