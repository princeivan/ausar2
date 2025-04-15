import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye } from "lucide-react";

const orders = [
  {
    id: "ORD-1234",
    date: "2023-12-15",
    total: "$245.99",
    items: 3,
    status: "Delivered",
  },
  {
    id: "ORD-1235",
    date: "2023-12-10",
    total: "$125.50",
    items: 2,
    status: "Shipping",
  },
  {
    id: "ORD-1236",
    date: "2023-12-05",
    total: "$78.25",
    items: 1,
    status: "Processing",
  },
  {
    id: "ORD-1237",
    date: "2023-11-28",
    total: "$312.75",
    items: 4,
    status: "Delivered",
  },
  {
    id: "ORD-1238",
    date: "2023-11-20",
    total: "$145.00",
    items: 2,
    status: "Delivered",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Shipping":
      return "bg-blue-100 text-blue-800";
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderHistory = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't placed any orders yet.
          </p>
          <Button asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
