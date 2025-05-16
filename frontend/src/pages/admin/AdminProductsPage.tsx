import { useEffect, useState } from "react";
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
import { Search, Edit, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useStore } from "../../context/StoreContext";
import { toast } from "sonner";
import api from "../../../api";
import { Product } from "../../context/StoreContext";
import ProductModal from "../../components/admin/ProductModal";

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const { userRole } = useStore();

  useEffect(() => {
    if (userRole !== "admin") {
      toast.error("Unauthorized access");
      return;
    }
    fetchProducts();
  }, [userRole]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/products/");
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/api/admin/products/${productId}/`);
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

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

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Unauthorized access</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Products Management"
        description="View and manage your product catalog"
        actionLabel="Add Product"
        onAction={handleAdd}
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Import
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </div>

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
        onSuccess={fetchProducts}
      />
    </AdminLayout>
  );
};

export default AdminProductsPage;
