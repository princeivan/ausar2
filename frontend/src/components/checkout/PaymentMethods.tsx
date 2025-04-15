import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
// import { Button } from '../../components/ui/button';
// import { Check } from 'lucide-react';

interface PaymentMethodsProps {
  selectedMethod: string;
  onChange: (value: string) => void;
  paymentDetails: {
    mpesaPhone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
  };
  onPaymentDetailChange: (field: string, value: string) => void;
}

export const PaymentMethods = ({
  selectedMethod,
  onChange,
  paymentDetails,
  onPaymentDetailChange,
}: PaymentMethodsProps) => {
  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={onChange}
      className="space-y-4"
    >
      <Card
        className={`border ${
          selectedMethod === "mpesa" ? "border-brand-blue" : "border-gray-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start">
            <RadioGroupItem value="mpesa" id="mpesa" className="mt-1" />
            <div className="ml-3 flex-grow">
              <Label htmlFor="mpesa" className="text-base font-medium">
                M-Pesa
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Pay with M-Pesa mobile money. You'll receive an STK push to
                complete the payment.
              </p>

              {selectedMethod === "mpesa" && (
                <div className="mt-3">
                  <Label htmlFor="mpesaPhone" className="text-sm">
                    Phone Number (e.g., 254712345678)
                  </Label>
                  <Input
                    id="mpesaPhone"
                    placeholder="254712345678"
                    className="mt-1"
                    value={paymentDetails.mpesaPhone || ""}
                    onChange={(e) =>
                      onPaymentDetailChange("mpesaPhone", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
            <div className="ml-auto">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
                alt="M-Pesa"
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border ${
          selectedMethod === "paypal" ? "border-brand-blue" : "border-gray-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start">
            <RadioGroupItem value="paypal" id="paypal" className="mt-1" />
            <div className="ml-3">
              <Label htmlFor="paypal" className="text-base font-medium">
                PayPal
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Pay with your PayPal account or credit card via PayPal.
              </p>
              {selectedMethod === "paypal" && (
                <p className="mt-3 text-sm text-blue-600">
                  You'll be redirected to PayPal to complete your payment
                  securely.
                </p>
              )}
            </div>
            <div className="ml-auto">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png"
                alt="PayPal"
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border ${
          selectedMethod === "stripe" ? "border-brand-blue" : "border-gray-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start">
            <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
            <div className="ml-3 flex-grow">
              <Label htmlFor="stripe" className="text-base font-medium">
                Credit/Debit Card
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Pay with your credit or debit card via Stripe's secure payment
                gateway.
              </p>

              {selectedMethod === "stripe" && (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                      value={paymentDetails.cardNumber || ""}
                      onChange={(e) =>
                        onPaymentDetailChange("cardNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-sm">
                        Expiry Date
                      </Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        className="mt-1"
                        value={paymentDetails.cardExpiry || ""}
                        onChange={(e) =>
                          onPaymentDetailChange("cardExpiry", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvc" className="text-sm">
                        CVC
                      </Label>
                      <Input
                        id="cardCvc"
                        placeholder="123"
                        className="mt-1"
                        type="password"
                        value={paymentDetails.cardCvc || ""}
                        onChange={(e) =>
                          onPaymentDetailChange("cardCvc", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center space-x-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="h-6"
              />
              <img
                src="https://www.svgrepo.com/show/328093/mastercard.svg"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="https://www.svgrepo.com/show/328072/amex.svg"
                alt="Amex"
                className="h-6"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border ${
          selectedMethod === "bank" ? "border-brand-blue" : "border-gray-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start">
            <RadioGroupItem value="bank" id="bank" className="mt-1" />
            <div className="ml-3 flex-grow">
              <Label htmlFor="bank" className="text-base font-medium">
                Bank Transfer
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Make a direct bank transfer. Your order will be processed after
                payment is confirmed.
              </p>

              {selectedMethod === "bank" && (
                <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                  <p className="font-medium">Bank Transfer Details:</p>
                  <p>Bank: First National Bank</p>
                  <p>Account Number: 1234567890</p>
                  <p>Branch Code: 123456</p>
                  <p>Reference: Your Order #</p>
                  <p className="mt-2 text-gray-600">
                    Please use your order number as the payment reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </RadioGroup>
  );
};
