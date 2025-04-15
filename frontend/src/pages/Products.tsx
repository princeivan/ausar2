import { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { toast } from "sonner";

const Products = () => {
  const { products, loading, pagination, fetchProducts } = useStore();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    ...new Set(
      products.map((product) => product.category?.name).filter(Boolean)
    ),
  ];
  const brands = [
    ...new Set(products.map((product) => product.brand).filter(Boolean)),
  ];

  // Apply filters whenever products or filter criteria change
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          false ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false
      );
    }

    // Filter by price (convert string price to number)
    result = result.filter((product) => {
      const price = parseFloat(product.new_price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedCategories.length > 0) {
      result = result.filter(
        (product) =>
          product.category && selectedCategories.includes(product.category.name)
      );
    }

    if (selectedBrands.length > 0) {
      result = result.filter(
        (product) => product.brand && selectedBrands.includes(product.brand)
      );
    }

    setFilteredProducts(result);
  }, [products, searchTerm, priceRange, selectedCategories, selectedBrands]);

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchProducts("", pagination.currentPage + 1).catch((err) => {
        toast.error("Failed to fetch next page", err);
      });
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevious) {
      fetchProducts("", pagination.currentPage - 1).catch((err) => {
        toast.error("Failed to fetch previous page", err);
      });
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
      fetchProducts("", pageNumber).catch((err) => {
        toast.error("Failed to fetch the page", err);
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 2000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  if (loading && pagination.currentPage === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-4 h-80 animate-pulse"
            >
              <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
              <div className="bg-gray-200 h-4 rounded-md mb-2 w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded-md mb-4 w-1/2"></div>
              <div className="bg-gray-200 h-10 rounded-md w-full mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="ml-2 md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {showFilters && (
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 2000]}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Ksh {priceRange[0]}</span>
                  <span>Ksh {priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        id={`category-mobile-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label
                        htmlFor={`category-mobile-${category}`}
                        className="ml-2 text-sm font-normal cursor-pointer"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-mobile-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandChange(brand)}
                      />
                      <Label
                        htmlFor={`brand-mobile-${brand}`}
                        className="ml-2 text-sm font-normal cursor-pointer"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>

              <Button className="w-full" onClick={() => setShowFilters(false)}>
                View Results ({filteredProducts.length})
              </Button>
            </div>
          </div>
        )}

        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 2000]}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm font-normal cursor-pointer"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Brands</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandChange(brand)}
                      />
                      <Label
                        htmlFor={`brand-${brand}`}
                        className="ml-2 text-sm font-normal cursor-pointer"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-500">
                {filteredProducts.length} products found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? // Show skeleton loading states when fetching more pages
                    [...Array(9)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 rounded-lg p-4 h-80 animate-pulse"
                      >
                        <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
                        <div className="bg-gray-200 h-4 rounded-md mb-2 w-3/4"></div>
                        <div className="bg-gray-200 h-4 rounded-md mb-4 w-1/2"></div>
                        <div className="bg-gray-200 h-10 rounded-md w-full mt-auto"></div>
                      </div>
                    ))
                  : filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>

              {pagination.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevPage}
                        className={
                          !pagination.hasPrevious
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({
                      length: Math.min(5, pagination.totalPages),
                    }).map((_, i) => {
                      // Logic to show current page and adjacent pages
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = pagination.currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={pagination.currentPage === pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        className={
                          !pagination.hasNext
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
