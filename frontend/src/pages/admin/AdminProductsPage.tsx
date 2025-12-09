import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Edit,
  Trash2,
  Package,
  BarChart,
  TrendingDown,
  AlertTriangle,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useStore } from "../../context/StoreContext";
import { toast } from "sonner";
import api from "../../../api";
import { Product } from "../../context/StoreContext";
import ProductModal from "../../components/admin/ProductModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export interface FormDataType {
  title: string;
  description: string;
  image: File | null;
  brand: string;
  category: string;
  new_price: string;
  old_price: string;
  countInStock: string;
  is_active: boolean;
  rating: number;
  numReviews: number;
  specs: string;
  best_seller: boolean;
  flash_sale: boolean;
  flash_sale_price: string;
  flash_sale_end: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const { userInfo, category, handleError, clearError } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    image: null,
    brand: "",
    category: "",
    new_price: "",
    old_price: "",
    countInStock: "",
    is_active: false,
    rating: 0,
    numReviews: 0,
    specs: "",
    best_seller: false,
    flash_sale: false,
    flash_sale_price: "",
    flash_sale_end: "",
  });
  useEffect(() => {
    if (userInfo?.role !== "admin") {
      toast.error("Unauthorized access");
      return;
    }
    fetchProducts();
  }, [userInfo, searchTerm, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/products/", {
        params: {
          search: searchTerm,
          category: categoryFilter,
          stock: stockFilter,
        },
        withCredentials: true,
      });
      setProducts(response.data.products);
      setAnalytics(response.data.analytics);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        title: selectedProduct.title || "",
        description: selectedProduct.description || "",
        image: null,
        brand: selectedProduct.brand || "",
        category: selectedProduct.category?.name || "",
        new_price: selectedProduct.new_price || "",
        old_price: selectedProduct.old_price || "",
        countInStock: selectedProduct.countInStock?.toString() || ")",
        is_active: selectedProduct.is_active ?? true,
        rating: selectedProduct.rating ?? 0,
        numReviews: selectedProduct.numReviews ?? 0,
        specs: selectedProduct.specs
          ? JSON.stringify(selectedProduct.specs)
          : "",
        best_seller: selectedProduct.best_seller ?? false,
        flash_sale: selectedProduct.flash_sale ?? false,
        flash_sale_price: selectedProduct.flash_sale_price ?? "",
        flash_sale_end: selectedProduct.flash_sale_end || "",
      });
    } else {
      resetFormData();
    }
  }, [selectedProduct]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(undefined);
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      brand: "",
      category: "",
      new_price: "",
      old_price: "",
      countInStock: "",
      is_active: false,
      rating: 0,
      numReviews: 0,
      specs: "",
      best_seller: false,
      flash_sale: false,
      flash_sale_price: "",
      flash_sale_end: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.new_price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const success = selectedProduct
      ? await updateProduct(selectedProduct.id, formData)
      : await createProduct(formData);

    if (success) {
      toast.success(
        `Product ${selectedProduct ? "updated" : "created"} successfully`
      );
      resetFormData();
      handleModalClose();
    } else {
      toast.error(`Failed to ${selectedProduct ? "update" : "create"} product`);
    }
  };

  const createProduct = async (formData: FormDataType): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            payload.append(key, value);
          } else if (key !== "image") {
            payload.append(key, String(value));
          } else {
            payload.append(key, String(value));
          }
        }
      });

      await api.post("/api/products/", payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
      return true;
    } catch (err) {
      handleError(err, "Failed to create product");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    formData: FormDataType
  ): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            payload.append(key, value);
          } else if (key !== "image") {
            payload.append(key, String(value));
          } else {
            payload.append(key, String(value));
          }
        }
      });

      await api.patch(`/api/products/${id}/`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
      return true;
    } catch (err) {
      handleError(err, "Failed to update product");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/api/admin/products/${productId}/`, {
        withCredentials: true,
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Products Management"
        description="View and manage your product catalog"
        actionLabel="Add Product"
        onAction={handleAdd}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_products}
            </div>
            <p className="text-xs text-muted-foreground">Available products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics?.total_stock}
            </div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics?.low_stock}
            </div>
            <p className="text-xs text-muted-foreground">≤20 units left</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.out_of_stock}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.avg_stock}
            </div>
            <p className="text-xs text-muted-foreground">Per product</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="min-w-[150px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {category.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock (≤20)</SelectItem>
                  <SelectItem value="medium">Medium Stock (21-100)</SelectItem>
                  <SelectItem value="high">High Stock (&gt;100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>${product.new_price}</TableCell>
                  <TableCell>{product.countInStock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.countInStock > 10
                          ? "bg-green-100 text-green-800"
                          : product.countInStock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.countInStock > 10
                        ? "In Stock"
                        : product.countInStock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ProductModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        product={selectedProduct}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </AdminLayout>
  );
};

export default AdminProductsPage;
