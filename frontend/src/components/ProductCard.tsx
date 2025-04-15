import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../context/StoreContext";
import { Button } from "../components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useStore } from "../context/StoreContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  const { id, title, new_price, old_price, image, rating, numReviews } =
    product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link
      to={`/products/${id}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full"
    >
      <div className="relative pt-[75%] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {old_price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(
              ((parseFloat(old_price) - parseFloat(new_price)) /
                parseFloat(old_price)) *
                100
            )}
            % OFF
          </div>
        )}
        {product.flash_sale && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            FLASH SALE
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 ${
                i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500">({numReviews})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center mb-2">
            <span className="text-sm font-bold text-gray-900">
              Ksh {parseFloat(new_price).toFixed(2)}
            </span>
            {old_price && (
              <span className="ml-2 text-xs text-gray-500 line-through">
                Ksh {parseFloat(old_price).toFixed(2)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-xs"
          >
            <ShoppingCart className="mr-1 h-3 w-3" /> Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
