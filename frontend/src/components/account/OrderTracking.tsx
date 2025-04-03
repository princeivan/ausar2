import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import { Package, Truck, CheckCircle, ArrowDown, Home } from "lucide-react";

const OrderTracking = () => {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<null | {
    orderId: string;
    status: string;
    estimatedDelivery: string;
    currentLocation: string;
    updates: { date: string; status: string; location: string }[];
  }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate tracking lookup - in a real app, this would call an API
    if (orderId.trim()) {
      // For demo purposes, always return a tracking result
      setTrackingResult({
        orderId: orderId,
        status: "In Transit",
        estimatedDelivery: "December 22, 2023",
        currentLocation: "Regional Distribution Center, San Francisco, CA",
        updates: [
          {
            date: "December 20, 2023 - 9:15 AM",
            status: "In Transit",
            location: "Regional Distribution Center, San Francisco, CA",
          },
          {
            date: "December 19, 2023 - 6:30 PM",
            status: "Shipped",
            location: "Central Warehouse, Los Angeles, CA",
          },
          {
            date: "December 18, 2023 - 2:45 PM",
            status: "Order Processed",
            location: "Fulfillment Center, Los Angeles, CA",
          },
          {
            date: "December 17, 2023 - 10:30 AM",
            status: "Order Confirmed",
            location: "BrandifyShop HQ",
          },
        ],
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid order ID.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Track Your Order</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="orderId" className="mb-2 block">
              Enter your order ID
            </Label>
            <Input
              id="orderId"
              placeholder="e.g., ORD-1234"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-brand-blue hover:bg-blue-700"
            >
              Track Order
            </Button>
          </div>
        </div>
      </form>

      {trackingResult && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Order {trackingResult.orderId}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">{trackingResult.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Estimated Delivery</p>
                <p className="font-medium">
                  {trackingResult.estimatedDelivery}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600">Current Location</p>
                <p className="font-medium">{trackingResult.currentLocation}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Shipping Progress</h4>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

              {/* Shipping steps */}
              <div className="space-y-8 relative z-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Order Confirmed</h5>
                    <p className="text-sm text-gray-500">December 17, 2023</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Order Processed</h5>
                    <p className="text-sm text-gray-500">December 18, 2023</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Shipped</h5>
                    <p className="text-sm text-gray-500">December 19, 2023</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <ArrowDown className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">In Transit</h5>
                    <p className="text-sm text-gray-500">December 20, 2023</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    <Home className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-400">Delivered</h5>
                    <p className="text-sm text-gray-500">
                      Estimated: December 22, 2023
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Tracking Updates</h4>
            <div className="space-y-4">
              {trackingResult.updates.map((update, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-3 last:border-0"
                >
                  <p className="font-medium">{update.status}</p>
                  <p className="text-sm text-gray-500">{update.date}</p>
                  <p className="text-sm">{update.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!trackingResult && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No Tracking Information
          </h3>
          <p className="text-gray-500 mb-4">
            Enter your order ID above to track your package
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
