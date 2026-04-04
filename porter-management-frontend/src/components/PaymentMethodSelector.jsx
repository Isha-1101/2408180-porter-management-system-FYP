import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Loader2, CheckCircle2 } from "lucide-react";

/**
 * Payment Method Selector Component
 * Allows user to select between Cash and Digital (eSewa) payment
 */
export const PaymentMethodSelector = ({
  amount,
  onMethodSelect,
  isLoading = false,
  disabled = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "cash",
      name: "Pay in Cash",
      description: "Pay directly to the porter",
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: "digital",
      name: "eSewa (Digital)",
      description: "Secure online payment via eSewa",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  const handleConfirm = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      onMethodSelect(selectedMethod);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-slate-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Booking Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            NPR {amount?.toFixed(0)}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className="w-full text-left transition-all"
              >
                <Card
                  className={`${
                    selectedMethod === method.id
                      ? "border-[#0C4C40] border-2 bg-[#F5FBF2]"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.bgColor} ${method.borderColor} border-2`}
                      >
                        <Icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{method.name}</h4>
                        <p className="text-xs text-gray-500">
                          {method.description}
                        </p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#0C4C40]" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={isProcessing || isLoading || disabled}
          className="w-full"
          size="lg"
        >
          {isProcessing || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          {selectedMethod === "cash"
            ? "Porter will confirm payment receipt at completion"
            : "You'll be redirected to eSewa for secure payment"}
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
