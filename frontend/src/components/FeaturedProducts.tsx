import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { featuredProducts, loading } = useStore();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
          <div className="h-1 w-20 bg-brand-blue mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-3 h-64 animate-pulse"
            >
              <div className="bg-gray-200 h-32 rounded-md mb-2"></div>
              <div className="bg-gray-200 h-4 rounded-md mb-2 w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded-md mb-2 w-1/2"></div>
              <div className="bg-gray-200 h-8 rounded-md w-full mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
        <div className="h-1 w-20 bg-brand-blue mx-auto"></div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Discover our top-selling products ready to showcase your brand. Each
          item can be customized with your logo and colors.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-darkBlue transition-colors"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProducts;
