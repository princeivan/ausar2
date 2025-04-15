import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/ui/button";
import {
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, addToCart, loading } = useStore();
  const product = getProductById(id || "0");

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you are looking for does not exist.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-darkBlue transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.countInStock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, customization);
    toast.success("Product added to cart!");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setLogoFile(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-blue transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link
          to="/products"
          className="hover:text-brand-blue transition-colors"
        >
          Products
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link
          to={`/products/category/${product.category?.name}`}
          className="hover:text-brand-blue transition-colors"
        >
          {product.category?.name.charAt(0).toUpperCase() +
            product.category?.name.slice(1)}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700 font-medium">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain p-4"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-500">({product.numReviews})</span>
          </div>

          <div className="flex items-center mb-6">
            <span className="text-3xl font-bold text-gray-900">
              Ksh {parseFloat(product.new_price).toFixed(2)}
            </span>
            {product.old_price && (
              <>
                <span className="ml-2 text-lg text-gray-500 line-through">
                  Ksh {parseFloat(product.old_price).toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-red-500 font-medium">
                  {Math.round(
                    ((parseFloat(product.old_price) -
                      parseFloat(product.new_price)) /
                      parseFloat(product.old_price)) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
            {product.flash_sale && (
              <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                FLASH SALE
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Brand</h3>
            <p className="text-gray-700">{product.brand || 'Generic'}</p>
          </div>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="space-y-1">
                {Object.entries(product.specs).map(([key, value]) => (
                  <p key={key} className="text-gray-700">
                    <span className="font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </span>
                    {String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Custom Branding</h3>
            <Textarea
              placeholder="Enter your branding instructions (e.g., logo placement, colors, text)"
              className="mb-2"
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
            />
            <div className="flex items-center mt-2">
              <Input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button variant="outline" asChild className="mr-2">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  Upload Logo
                </label>
              </Button>
              {logoFile && (
                <span className="text-sm text-gray-500">{logoFile.name}</span>
              )}
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="border border-gray-300 rounded-md flex items-center mr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.countInStock}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-gray-500">
              {product.countInStock} items available
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full mb-4"
            size="lg"
            disabled={product.countInStock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.countInStock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>

          {/* Product Features */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-brand-blue mr-2" />
                <span className="text-sm">Quality Guarantee</span>
              </div>
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-brand-blue mr-2" />
                <span className="text-sm">Fast Shipping</span>
              </div>
              <div className="flex items-center">
                <RotateCcw className="h-5 w-5 text-brand-blue mr-2" />
                <span className="text-sm">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
