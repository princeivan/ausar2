import { useState } from "react";
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
import CategoryModal from "../../components/admin/CategoryModal"; // import the modal
import api from "../../../api";

const AdminCategoryPage = () => {
  const { category, fetchCategories } = useStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // const fetchCategories = async () => {
  //   const { data } = await api.get("/api/categories/");
  //   setCategory(data); // set categories in store
  // };

  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    await api.delete(`/api/categories/${id}/`);
    fetchCategories();
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingCategory) {
        // Edit
        await api.put(`/api/categories/${editingCategory.id}/`, data);
      } else {
        // Add
        await api.post(`/api/categories/`, data);
      }
      fetchCategories();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Categories Management"
        description="View and manage product categories"
        actionLabel="Add Category"
        onAction={handleAdd}
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
            {category
              ?.filter((cat) =>
                cat.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.total_products}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cat.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCategory}
      />
    </AdminLayout>
  );
};

export default AdminCategoryPage;
