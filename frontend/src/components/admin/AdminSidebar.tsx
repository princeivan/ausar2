import { Link } from "react-router-dom";
import {
  Home,
  User,
  Package,
  ShoppingBag,
  Tag,
  Layout,
  FileText,
  Calendar,
  Settings,
  Database,
  FileDigit,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";

// Define menu structure
const menuItems = [
  {
    id: 1,
    title: "Main",
    items: [
      {
        id: 1,
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
      },
      {
        id: 2,
        title: "Profile",
        url: "/users/1",
        icon: User,
      },
    ],
  },
  {
    id: 2,
    title: "Lists",
    items: [
      {
        id: 1,
        title: "Users",
        url: "/admin/users",
        icon: User,
      },
      {
        id: 2,
        title: "Products",
        url: "/admin/products",
        icon: Package,
      },
      {
        id: 3,
        title: "Orders",
        url: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        id: 4,
        title: "Categories",
        url: "/admin/category",
        icon: Tag,
      },
    ],
  },
  {
    id: 3,
    title: "General",
    items: [
      {
        id: 1,
        title: "Elements",
        url: "/admin/elements",
        icon: Layout,
      },
      {
        id: 3,
        title: "Forms",
        url: "/admin/forms",
        icon: FileText,
      },
      {
        id: 4,
        title: "Calendar",
        url: "/admin/calendar",
        icon: Calendar,
      },
    ],
  },
  {
    id: 4,
    title: "Maintenance",
    items: [
      {
        id: 1,
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
      {
        id: 2,
        title: "Backups",
        url: "/admin/backups",
        icon: Database,
      },
      {
        id: 3,
        title: "Logs",
        url: "/admin/logs",
        icon: FileDigit,
      },
    ],
  },
];

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">© 2025 Admin Panel</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
