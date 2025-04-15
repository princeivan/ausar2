import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

const Cart = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } =
    useStore();
  const navigate = useNavigate();
  let discountPercentage = 5;
  const subtotal = cartItems.reduce((total, item) => {
    const discountedPrice =
      parseFloat(item.product.new_price) -
      (parseFloat(item.product.new_price) * discountPercentage) / 100;
    return total + discountedPrice * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 15 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      updateCartItemQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 p-4 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
            </div>

            {cartItems.map((item) => {
              const { product, quantity, customization } = item;
              const discountedPrice = Math.round(
                parseFloat(product.new_price) -
                  (parseFloat(product.new_price) * discountPercentage) / 100
              );

              return (
                <React.Fragment key={product.id}>
                  <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4 items-center">
                    {/* Mobile Remove Button */}
                    <div className="md:hidden flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-6 flex items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4 shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-fit"
                        />
                      </div>
                      <div>
                        <Link
                          to={`/products/Ksh {product.id}`}
                          className="font-medium text-gray-900 hover:text-brand-blue transition-colors"
                        >
                          {product.title}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          Brand: {product.brand}
                        </div>
                        {customization && (
                          <div className="text-sm text-gray-500 mt-1">
                            Customization: {customization}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-center flex md:block items-center">
                      <span className="text-sm text-gray-500 mr-2 md:hidden">
                        Price:
                      </span>
                      <span className="font-medium">Ksh {discountedPrice}</span>
                      {discountPercentage > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          Ksh {product.new_price}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center md:justify-center">
                      <span className="text-sm text-gray-500 mr-2 md:hidden">
                        Quantity:
                      </span>
                      <div className="border border-gray-300 rounded-md flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(product.id, quantity - 1)
                          }
                          disabled={quantity <= 1}
                          className="h-8 w-8 rounded-none"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(product.id, quantity + 1)
                          }
                          disabled={quantity >= product.countInStock}
                          className="h-8 w-8 rounded-none"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-2 text-center flex md:block items-center justify-between">
                      <span className="text-sm text-gray-500 mr-2 md:hidden">
                        Subtotal:
                      </span>
                      <span className="font-medium">
                        Ksh {(discountedPrice * quantity).toFixed(2)}
                      </span>

                      {/* Desktop Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(product.id)}
                        className="hidden md:inline-flex text-gray-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </React.Fragment>
              );
            })}

            <div className="p-4 flex justify-between">
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
              <Link to="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <span className="font-bold">Ksh {total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full mb-4" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Secure payments powered by Stripe, PayPal & M-Pesa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
