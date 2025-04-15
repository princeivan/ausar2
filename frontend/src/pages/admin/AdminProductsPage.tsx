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

// Sample data
const products = [
  {
    id: 1,
    name: "Custom T-Shirt",
    category: "Apparel",
    price: 19.99,
    stock: 120,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Branded Mug",
    category: "Drinkware",
    price: 12.99,
    stock: 85,
    status: "In Stock",
  },
  {
    id: 3,
    name: "Company Notebook",
    category: "Office",
    price: 8.99,
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Logo Cap",
    category: "Apparel",
    price: 15.99,
    stock: 42,
    status: "In Stock",
  },
  {
    id: 5,
    name: "Wireless Charger",
    category: "Technology",
    price: 29.99,
    stock: 18,
    status: "Low Stock",
  },
];

const AdminProductsPage = () => {
  return (
    <AdminLayout>
      <AdminPageHeader
        title="Products Management"
        description="View and manage your product catalog"
        actionLabel="Add Product"
        onAction={() => alert("Add product clicked")}
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search products..." className="pl-8" />
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "In Stock"
                        ? "bg-green-100 text-green-800"
                        : product.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
};

export default AdminProductsPage;
