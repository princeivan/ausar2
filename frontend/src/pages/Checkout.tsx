import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Steps } from "../components/checkout/Steps";
import { PaymentMethods } from "../components/checkout/PaymentMethods";

const Checkout = () => {
  const { cartItems, clearCart } = useStore();
  const navigate = useNavigate();

  const steps = [
    { id: 1, name: "Review" },
    { id: 2, name: "Shipping" },
    { id: 3, name: "Payment" },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Kenya",
    paymentMethod: "mpesa",
    specialInstructions: "",
  });

  const subtotal = cartItems.reduce((total, item) => {
    const discountedPrice =
      item.product.price -
      (item.product.price * item.product.discountPercentage) / 100;
    return total + discountedPrice * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 15 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would process the order
    toast.success("Order placed successfully!");
    clearCart();
    navigate("/account", { state: { orderPlaced: true } });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            You need to add items to your cart before checking out.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-600 mb-8">
        Complete your order in a few simple steps
      </p>

      <div className="mb-8">
        <Steps currentStep={currentStep} steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  1. Review Your Order
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const { product, quantity, customization } = item;
                    const discountedPrice = Math.round(
                      product.price -
                        (product.price * product.discountPercentage) / 100
                    );

                    return (
                      <div
                        key={product.id}
                        className="flex items-start border-b border-gray-100 pb-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 shrink-0">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{product.title}</h3>
                            <span className="font-medium">
                              ${(discountedPrice * quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {quantity}
                          </div>
                          {customization && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">
                                Customization:
                              </span>{" "}
                              {customization}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={nextStep}>
                    Continue to Shipping <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  2. Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip/Postal Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="specialInstructions">
                    Special Instructions (Optional)
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special delivery instructions or notes"
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit">
                    Continue to Payment <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-semibold mb-4">
                  3. Payment Method
                </h2>

                <PaymentMethods
                  selectedMethod={formData.paymentMethod}
                  onChange={handleRadioChange}
                />

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Order Processing Information
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>
                      Your order will be processed immediately after payment
                    </li>
                    <li>
                      You'll receive a confirmation email with your order
                      details
                    </li>
                    <li>
                      Products will be packaged and shipped within 1-2 business
                      days
                    </li>
                    <li>You'll receive tracking information by email</li>
                    <li>Track your order status in your account dashboard</li>
                  </ol>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit">Place Order</Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                Need Custom Branding?
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                If you'd like to add your logo or custom designs to these
                products, request a quote for our custom branding services.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full bg-white"
                size="sm"
              >
                <a href="/custom-branding">Request Branding Quote</a>
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Secure payments powered by Stripe, PayPal & M-Pesa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
