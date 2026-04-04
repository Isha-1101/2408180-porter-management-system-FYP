import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, Loader2, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Payment Status Display Component
 * Shows payment status, allows retries for failed payments
 */
export const PaymentStatus = ({ paymentId, bookingId, onSuccess }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchPaymentStatus();
    // Poll for status updates every 3 seconds
    const interval = setInterval(fetchPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(
        `/core-api/payments/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPayment(response.data.data);
      setLoading(false);

      // If payment confirmed, notify parent
      if (
        (response.data.data.status === "confirmed" ||
          response.data.data.status === "verified") &&
        onSuccess
      ) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (payment?.method !== "digital") {
      toast.error("Can only retry digital payments");
      return;
    }

    setRetrying(true);
    try {
      const response = await axios.post(
        `/core-api/payments/${paymentId}/retry-esewa`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { esewaData, gatewayUrl } = response.data.data;

      // Redirect to eSewa gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = gatewayUrl;

      Object.keys(esewaData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = esewaData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to retry payment");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading payment status...
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return null;
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      title: "Payment Pending",
      description: "Waiting for payment confirmation...",
    },
    confirmed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      title: "Payment Confirmed",
      description: "Your payment has been processed successfully",
    },
    verified: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      title: "Payment Verified",
      description: "Your payment has been verified by admin",
    },
    failed: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      title: "Payment Failed",
      description: payment.failureReason || "Payment could not be processed",
    },
  };

  const config = statusConfig[payment.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={config.bgColor}>
          <AlertDescription className={config.color}>
            {config.description}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">Rs. {payment.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Method:</span>
            <span className="font-semibold capitalize">
              {payment.method === "digital" ? "eSewa" : "Cash"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold capitalize">{payment.status}</span>
          </div>

          {payment.retryCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retry Attempts:</span>
              <span className="text-sm">{payment.retryCount}</span>
            </div>
          )}
        </div>

        {payment.status === "failed" && payment.method === "digital" && (
          <Button
            onClick={handleRetryPayment}
            disabled={retrying}
            variant="outline"
            className="w-full"
          >
            {retrying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Payment
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
