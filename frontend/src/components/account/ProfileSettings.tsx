import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import api from "../../../api";

interface ShippingAddress {
  town: string;
  address: string;
  postalCode: number;
  country: string;
  shippingPrice: number;
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
interface ProfileSettingsProps {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}
const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  setProfile,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    town: "",
    country: "",
    postalCode: "",
  });

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const response = await api.get("/api/profile/");
  //       setProfile(response.data);
  //     } catch (error) {
  //       console.error("Error fetching profile:", error);
  //     }
  //   };
  //   fetchProfile();
  // }, []);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone_number || "",
        avatar: profile.avatar || "",
        address: profile.shipping_address_data?.address || "",
        town: profile.shipping_address_data?.town || "",
        country: profile.shipping_address_data?.country || "",
        postalCode: profile.shipping_address_data?.postalCode?.toString() || "",
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      shipping_address_data: {
        address: formData?.address,
        town: formData?.town,
        postalCode: parseInt(formData.postalCode) || 0,
        country: formData.country,
      },
    };
    try {
      const response = await api.put("/api/profile/", updateData);
      setProfile(response.data);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          "There was an error updating your profile. Please try again.",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4 pt-4">Shipping Address</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Town</Label>
            <Input
              id="town"
              name="town"
              value={formData.town}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-brand-blue hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
