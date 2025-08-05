import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../../api";
import { useEffect, useState } from "react";

export interface DashboardData {
  categoryData: CategoryData[];
  recentOrders: RecentOrder[];
  salesData: SalesDataPoint[];
  stats: DashboardStats;
}

export interface CategoryData {
  name: string;
  value: number;
}
export interface RecentOrder {
  id: string;
  orderId: string;
  user: string;
  createdAt: string;
  status: string;
  totalPrice: string | number;
}
export interface SalesDataPoint {
  name: string;
  total: string | number;
}
export interface DashboardStats {
  total_revenue: string | number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_products: number;
  products_change: number;
  total_customers: number;
  customers_change: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6B6B",
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/api/admin/dashboard/", {
        withCredentials: true,
      });
      const data = response.data;

      console.log(data);

      setDashboardData({
        stats: data.stats,
        salesData: data.sales_data || [],
        categoryData: data.category_data || [],
        recentOrders: data.recent_orders || [],
      });
      // setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
    }
  };
  if (!dashboardData) return <div>Loading ....</div>;

  const { stats, salesData, categoryData, recentOrders } = dashboardData;
  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button>
            <Package className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" /> View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">Ksh {stats?.total_revenue}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.revenue_change}% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <p className="text-2xl font-bold">{stats?.total_orders}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.orders_change}% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                <p className="text-2xl font-bold">{stats?.total_products}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.products_change}% from last month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-bold">{stats?.total_customers}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.customers_change}% from last month
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.user}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Ksh{" "}
                      {Number(order.totalPrice).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
