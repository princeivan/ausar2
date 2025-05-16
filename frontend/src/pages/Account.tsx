import { useEffect, useState } from "react";
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
import api from "../../api";

interface ShippingAddress {
  town: string;
  address: string;
  postalCode: Number;
  country: string;
  shippingPrice: Number;
}
interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  shipping_address_data: ShippingAddress;
}
const Account = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/");
        setProfile(response?.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // In a real app, this would clear authentication state
  };
  const handleEdit = () => {
    // Trigger file input
    // document.getElementById('avatarInput').click();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <div className="relative h-24 w-24 group">
                    <img
                      src={profile?.avatar}
                      alt="User"
                      className="h-full w-full object-cover rounded-full"
                    />

                    {/* Overlay appears on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={handleEdit}
                        className="bg-white text-black text-xs px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold">{profile?.first_name}</h2>
                <p className="text-gray-500">{profile?.email}</p>
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
                  <ProfileSettings profile={profile} setProfile={setProfile} />
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
