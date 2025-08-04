import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import {
  ShoppingCart,
  Check,
  Loader2,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Steps } from "../components/checkout/Steps";
import api from "../../api";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type Order = {
  orderId: string;
};

const Checkout = () => {
  const { cartItems, clearCart, userInfo } = useStore();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const steps = [
    { id: 1, name: "Review" },
    { id: 2, name: "Shipping" },
    { id: 3, name: "Payment" },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
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
    paymentMethod: "mpesa",
    specialInstructions: "",
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: 0,
    isPaid: false,
    status: "Pending",
    isDelivered: false,
  });
  const [paymentDetails, setPaymentDetails] = useState({
    mpesaPhone: "",
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showMpesaPopup, setShowMpesaPopup] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState({
    step: "initiating",
    message: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        firstName: userInfo?.first_name || "",
        lastName: userInfo?.last_name || "",
        email: userInfo?.email || "",
        phone: userInfo?.phone_number || "",
        avatar: userInfo?.avatar || "",
        address: userInfo.shipping_address_data?.address || "",
        town: userInfo.shipping_address_data?.town || "",
        country: userInfo.shipping_address_data?.country || "",
        postalCode:
          userInfo.shipping_address_data?.postalCode?.toString() || "",
      }));
    }
  }, [userInfo]);

  const subtotal = cartItems.reduce((total, item) => {
    return total + parseFloat(item.product.new_price) * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 15 : 0;
  const taxPrice = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + shippingCost + taxPrice;

  const tax = parseFloat(taxPrice.toFixed(2));
  const roundedTotalPrice = parseFloat(totalAmount.toFixed(2));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value,
    });
    setPaymentDetails({
      mpesaPhone: "",
    });
  };

  const handlePaymentDetailChange = (field: string, value: string) => {
    setPaymentDetails({
      ...paymentDetails,
      [field]: value,
    });
  };

  // Create order first (without payment)
  const createOrder = async () => {
    const orderItems = cartItems.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      price: item.product.new_price,
    }));

    const orderData = {
      paymentmethod: formData.paymentMethod,
      taxPrice: tax,
      shippingPrice: shippingCost,
      totalPrice: roundedTotalPrice,
      isPaid: false,
      status: "pending",
      isDelivered: false,
      items: orderItems,
      shippingAddress: {
        address: formData.address,
        town: formData.town,
        postalCode: parseInt(formData.postalCode) || 0,
        country: formData.country,
      },
    };

    try {
      const access = localStorage.getItem("access");
      const response = await api.post("/api/orders/", orderData, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (response.data && response.data.orderId) {
        return response.data;
      } else {
        throw new Error("Order ID not returned from the server.");
      }
    } catch (error) {
      console.error("Order Creation Error", error);
      throw error;
    }
  };

  // Process M-Pesa payment with popup
  const processMpesaPayment = async (orderId: string) => {
    const phoneNumber = paymentDetails.mpesaPhone || formData.phone;

    if (!phoneNumber) {
      throw new Error("Phone number is required for M-Pesa payment");
    }

    // Show popup and update status
    setShowMpesaPopup(true);
    setMpesaStatus({
      step: "initiating",
      message: "Initiating M-Pesa payment...",
      phoneNumber: phoneNumber,
    });

    try {
      const access = localStorage.getItem("access");

      // Update status to waiting
      setMpesaStatus({
        step: "waiting",
        message: "Check your phone for STK push",
        phoneNumber: phoneNumber,
      });

      const response = await api.post(
        `/api/payments/pay-for-order/${orderId}/`,
        {
          payment_method: "mpesa",
          phone_number: phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (response.data.success) {
        // Update status to processing
        setMpesaStatus({
          step: "processing",
          message: "Processing your payment...",
          phoneNumber: phoneNumber,
        });

        // Start polling for payment status
        const statusResult = await pollPaymentStatus(orderId);

        if (statusResult.success && statusResult.paid) {
          setMpesaStatus({
            step: "success",
            message: "Payment successful!",
            phoneNumber: phoneNumber,
          });

          // Wait a moment to show success, then close popup
          setTimeout(() => {
            setShowMpesaPopup(false);
            toast.success("Payment completed successfully!");
            clearCart();
            navigate("/account", { state: { orderPlaced: true, orderId } });
          }, 2000);
        } else {
          setMpesaStatus({
            step: "failed",
            message: statusResult.error || "Payment verification failed",
            phoneNumber: phoneNumber,
          });
        }
      } else {
        setMpesaStatus({
          step: "failed",
          message: response.data.message || "Failed to initiate M-Pesa payment",
          phoneNumber: phoneNumber,
        });
      }
    } catch (error: any) {
      console.error("M-Pesa Payment Error", error);
      setMpesaStatus({
        step: "failed",
        message:
          error.response?.data?.error || error.message || "Payment failed",
        phoneNumber: phoneNumber,
      });
    }
  };

  // Process Stripe payment with proper verification
  const processStripePayment = async (orderId: string) => {
    if (!stripe || !elements) {
      throw new Error("Stripe has not loaded properly");
    }

    try {
      const access = localStorage.getItem("access");

      // First, create payment intent on your backend
      const response = await api.post(
        `/api/payments/pay-for-order/${orderId}/`,
        {
          payment_method: "visa",
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!response.data.success || !response.data.client_secret) {
        throw new Error("Failed to create payment intent");
      }

      console.log("Stripe Payment Response", response.data);
      const clientSecret = response.data.client_secret;
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.town,
                postal_code: formData.postalCode,
                country: formData.country === "Kenya" ? "KE" : formData.country,
              },
            },
          },
        }
      );

      console.log("Stripe Payment Response", clientSecret);
      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (paymentIntent.status === "succeeded") {
        const confirmResponse = await api.post(
          "/api/payments/confirm-stripe-payment/",
          { payment_intent_id: paymentIntent.id },
          { headers: { Authorization: `Bearer ${access}` } }
        );
        console.log("Confirm payment result:", confirmResponse.data);

        const verificationResult = await pollPaymentStatus(orderId, 10);
        console.log("verification results", verificationResult);

        if (confirmResponse.data.success && confirmResponse.data.order_id) {
          toast.success("Payment completed successfully!");
          clearCart();
          navigate("/account", { state: { orderPlaced: true, orderId } });
        } else {
          throw new Error("Payment verification failed");
        }
      } else {
        throw new Error("Payment was not completed");
      }
    } catch (error: any) {
      console.error("Stripe Payment Error", error);
      throw error;
    }
  };

  // M-Pesa Popup Component
  const MpesaPaymentPopup = () => {
    const getStatusIcon = () => {
      switch (mpesaStatus.step) {
        case "initiating":
          return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
        case "waiting":
          return (
            <Smartphone className="w-8 h-8 text-green-500 animate-pulse" />
          );
        case "processing":
          return <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />;
        case "success":
          return <CheckCircle className="w-8 h-8 text-green-500" />;
        case "failed":
          return <AlertCircle className="w-8 h-8 text-red-500" />;
        default:
          return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      }
    };

    const getStatusMessage = () => {
      switch (mpesaStatus.step) {
        case "initiating":
          return "Initiating M-Pesa payment...";
        case "waiting":
          return `Check your phone ${mpesaStatus.phoneNumber} for STK push`;
        case "processing":
          return "Processing your payment...";
        case "success":
          return "Payment successful! Completing your order...";
        case "failed":
          return mpesaStatus.message || "Payment failed. Please try again.";
        default:
          return "Processing payment...";
      }
    };

    const getProgressPercentage = () => {
      switch (mpesaStatus.step) {
        case "initiating":
          return 25;
        case "waiting":
          return 50;
        case "processing":
          return 75;
        case "success":
          return 100;
        case "failed":
          return 0;
        default:
          return 25;
      }
    };

    const handleClose = () => {
      setShowMpesaPopup(false);
      setIsProcessing(false);
      setPaymentProcessing(false);
    };

    const handleRetry = () => {
      setShowMpesaPopup(false);
      // Reset form and allow retry
      setIsProcessing(false);
      setPaymentProcessing(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
          {/* Close button - only show if failed */}
          {mpesaStatus.step === "failed" && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-center">
            {/* Status Icon */}
            <div className="mb-4 flex justify-center">{getStatusIcon()}</div>

            {/* M-Pesa Logo/Title */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                M-Pesa Payment
              </h3>
              <div className="text-2xl font-bold text-green-600">
                Ksh {roundedTotalPrice.toFixed(2)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    mpesaStatus.step === "failed"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            <p className="text-gray-600 mb-4">{getStatusMessage()}</p>

            {/* Additional Instructions */}
            {mpesaStatus.step === "waiting" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700">
                  1. Check your phone for the M-Pesa STK push notification
                  <br />
                  2. Enter your M-Pesa PIN to complete the payment
                  <br />
                  3. Wait for confirmation
                </p>
              </div>
            )}

            {mpesaStatus.step === "processing" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-700">
                  Please wait while we confirm your payment with M-Pesa...
                </p>
              </div>
            )}

            {/* Retry button for failed payments */}
            {mpesaStatus.step === "failed" && (
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Order Info */}
            {createdOrder && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Order #{createdOrder.orderId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Poll payment status with improved error handling
  const pollPaymentStatus = async (orderId: string, maxAttempts = 30) => {
    let attempts = 0;

    const checkStatus = async (): Promise<{
      success: boolean;
      paid?: boolean;
      error?: string;
    }> => {
      try {
        const access = localStorage.getItem("access");
        const response = await api.get(
          `/api/payments/order-payment-status/${orderId}/`,
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );

        const { is_paid, payment } = response.data;

        if (is_paid && payment?.status === "completed") {
          return { success: true, paid: true };
        } else if (payment?.status === "failed") {
          return { success: false, error: "Payment failed" };
        } else if (attempts >= maxAttempts) {
          return {
            success: false,
            error: "Payment timeout - please check your order status",
          };
        }

        attempts++;
        // Wait 2 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkStatus();
      } catch (error: any) {
        console.error("Payment status check error", error);
        if (attempts >= maxAttempts) {
          return { success: false, error: "Failed to verify payment status" };
        }
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkStatus();
      }
    };

    return checkStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment details based on selected payment method
    if (formData.paymentMethod === "mpesa") {
      const phoneNumber = paymentDetails.mpesaPhone || formData.phone;
      if (!phoneNumber) {
        toast.error("Please enter your M-Pesa phone number");
        return;
      }
    }

    if (formData.paymentMethod === "visa") {
      if (!stripe || !elements) {
        toast.error("Stripe is not ready. Please refresh and try again.");
        return;
      }
    }

    setIsProcessing(true);
    setPaymentProcessing(true);

    try {
      // Step 1: Create the order
      toast.info("Creating your order...");
      const orderResponse = await createOrder();
      const orderId = orderResponse.orderId;
      setCreatedOrder(orderResponse);

      toast.success("Order created successfully!");

      // Step 2: Process payment based on selected method
      if (formData.paymentMethod === "mpesa") {
        await processMpesaPayment(orderId);
      } else if (formData.paymentMethod === "visa") {
        toast.info("Processing card payment...");
        await processStripePayment(orderId);
      }
    } catch (error: any) {
      console.error("Checkout Error", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to process order"
      );
      setIsProcessing(false);
      setPaymentProcessing(false);
    }
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
      {/* M-Pesa Payment Popup */}
      {showMpesaPopup && <MpesaPaymentPopup />}

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
                    const price = parseFloat(product.new_price);

                    return (
                      <div
                        key={product.id}
                        className="flex items-start border-b border-gray-100 pb-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 shrink-0">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{product.title}</h3>
                            <span className="font-medium">
                              Ksh {(price * quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {quantity}
                          </div>
                          {customization && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">
                                Customization:
                              </span>
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
                      placeholder="254712345678"
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
                    <Label htmlFor="town">Town</Label>
                    <Input
                      id="town"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Zip/Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
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

                {/* Payment Method Selection */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mpesa"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === "mpesa"}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                    />
                    <label
                      htmlFor="mpesa"
                      className="flex items-center cursor-pointer"
                    >
                      <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                      M-Pesa STK Push
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="visa"
                      name="paymentMethod"
                      value="visa"
                      checked={formData.paymentMethod === "visa"}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                    />
                    <label
                      htmlFor="visa"
                      className="flex items-center cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Credit/Debit Card
                    </label>
                  </div>
                </div>

                {/* Payment Details */}
                {formData.paymentMethod === "mpesa" && (
                  <div className="mb-6 p-4 border rounded-lg bg-green-50">
                    <h3 className="font-medium mb-3 text-green-800">
                      M-Pesa Payment Details
                    </h3>
                    <div>
                      <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                      <Input
                        id="mpesaPhone"
                        value={paymentDetails.mpesaPhone || formData.phone}
                        onChange={(e) =>
                          handlePaymentDetailChange(
                            "mpesaPhone",
                            e.target.value
                          )
                        }
                        placeholder="254712345678"
                        className="mt-1"
                      />
                      <p className="text-sm text-green-600 mt-1">
                        You will receive an STK push on this number to complete
                        payment
                      </p>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "visa" && (
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-medium mb-3 text-blue-800">
                      Card Payment Details
                    </h3>
                    <div className="p-3 border rounded bg-white">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#424770",
                              "::placeholder": {
                                color: "#aab7c4",
                              },
                            },
                            invalid: {
                              color: "#9e2146",
                            },
                          },
                        }}
                      />
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      Your payment information is securely processed by Stripe
                    </p>
                  </div>
                )}

                {/* Processing Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Process</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Your order will be created first</li>
                    <li>Payment will be processed immediately</li>
                    <li>
                      You'll receive confirmation once payment is completed
                    </li>
                    <li>
                      Order will be prepared for shipping after payment
                      confirmation
                    </li>
                  </ol>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {paymentProcessing
                          ? "Processing Payment..."
                          : "Creating Order..."}
                      </>
                    ) : (
                      "Place Order & Pay"
                    )}
                  </Button>
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
                <span className="font-medium">Ksh {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  Ksh {shippingCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">Ksh {tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  Ksh {roundedTotalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {createdOrder && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Order Created:</strong> #{createdOrder.orderId}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Complete payment to confirm your order
                </p>
              </div>
            )}

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
              Secure payments powered by Stripe & M-Pesa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
