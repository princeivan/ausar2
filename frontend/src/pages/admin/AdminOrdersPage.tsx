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
import { Search, Eye, Download } from "lucide-react";
import { Card } from "../../components/ui/card";

// Sample data
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2023-04-05",
    status: "Delivered",
    total: 125.99,
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2023-04-04",
    status: "Processing",
    total: 89.5,
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    date: "2023-04-04",
    status: "Shipped",
    total: 456.75,
    items: 5,
  },
  {
    id: "ORD-004",
    customer: "Sarah Williams",
    date: "2023-04-03",
    status: "Delivered",
    total: 67.25,
    items: 1,
  },
  {
    id: "ORD-005",
    customer: "Robert Brown",
    date: "2023-04-02",
    status: "Processing",
    total: 214.3,
    items: 4,
  },
];

const AdminOrdersPage = () => {
  return (
    <AdminLayout>
      <AdminPageHeader
        title="Orders Management"
        description="View and manage customer orders"
        actionLabel="Create Order"
        onAction={() => alert("Create order clicked")}
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search orders..." className="pl-8" />
        </div>
        <div className="flex gap-2">
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
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
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

export default AdminOrdersPage;
