import React from "react";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";

interface PaymentMethodsProps {
  selectedMethod: string;
  onChange: (value: string) => void;
}

export const PaymentMethods = ({
  selectedMethod,
  onChange,
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
            <div className="ml-3">
              <Label htmlFor="mpesa" className="text-base font-medium">
                M-Pesa
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Pay with M-Pesa mobile money. You'll receive an STK push to
                complete the payment.
              </p>
            </div>
            <div className="ml-auto">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.png/320px-M-PESA_LOGO-01.png"
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
            <div className="ml-3">
              <Label htmlFor="stripe" className="text-base font-medium">
                Credit/Debit Card
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Pay with your credit or debit card via Stripe's secure payment
                gateway.
              </p>
            </div>
            <div className="ml-auto flex items-center space-x-1">
              <img
                src="https://www.svgrepo.com/show/328121/visa.svg"
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
            <div className="ml-3">
              <Label htmlFor="bank" className="text-base font-medium">
                Bank Transfer
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Make a direct bank transfer. Your order will be processed after
                payment is confirmed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </RadioGroup>
  );
};
