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
const categories = [
  {
    id: 1,
    name: "Apparel",
    products: 48,
    description: "Clothing and wearable items",
    slug: "apparel",
    status: "Active",
  },
  {
    id: 2,
    name: "Drinkware",
    products: 24,
    description: "Mugs, cups, bottles and tumblers",
    slug: "drinkware",
    status: "Active",
  },
  {
    id: 3,
    name: "Office",
    products: 36,
    description: "Office supplies and stationery",
    slug: "office",
    status: "Active",
  },
  {
    id: 4,
    name: "Technology",
    products: 18,
    description: "Tech gadgets and accessories",
    slug: "technology",
    status: "Active",
  },
  {
    id: 5,
    name: "Outdoor",
    products: 12,
    description: "Outdoor and recreational items",
    slug: "outdoor",
    status: "Inactive",
  },
];

const AdminCategoryPage = () => {
  return (
    <AdminLayout>
      <AdminPageHeader
        title="Categories Management"
        description="View and manage product categories"
        actionLabel="Add Category"
        onAction={() => alert("Add category clicked")}
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search categories..." className="pl-8" />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.products}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {category.status}
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

export default AdminCategoryPage;
