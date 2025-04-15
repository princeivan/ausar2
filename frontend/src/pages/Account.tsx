import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { User, Package, CreditCard, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import ProfileSettings from "../components/account/ProfileSettings";
import OrderHistory from "../components/account/OrderHistory";
import OrderTracking from "../components/account/OrderTracking";

const Account = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // In a real app, this would clear authentication state
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold">John Doe</h2>
                <p className="text-gray-500">john.doe@example.com</p>
              </div>

              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>

              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setActiveTab("orders")}
              >
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>

              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setActiveTab("tracking")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Track Order
              </Button>

              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="tracking">Track Order</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <ProfileSettings />
                </TabsContent>

                <TabsContent value="orders">
                  <OrderHistory />
                </TabsContent>

                <TabsContent value="tracking">
                  <OrderTracking />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
