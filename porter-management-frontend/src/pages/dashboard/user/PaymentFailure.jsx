import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw, Banknote, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageLayout from "@/components/common/PageLayout";
import { useRetryEsewaPayment } from "@/apis/hooks/paymentHooks";
import axiosInstance from "@/apis/axiosInstance";
import toast from "react-hot-toast";

/**
 * PaymentFailure Page
 * 
 * Displayed after failed eSewa payment.
 * Provides options to retry payment or switch to cash.
 * 
 * URL params: ?bookingId=xxx&reason=xxx
 */
export const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSwitchingToCash, setIsSwitchingToCash] = useState(false);

  const bookingId = searchParams.get("bookingId");
  const reason = searchParams.get("reason") || "Payment failed or was cancelled";

  const { mutateAsync: retryPayment, isPending: isRetrying } = useRetryEsewaPayment();

  const handleRetryPayment = async () => {
    if (!bookingId) {
      toast.error("No booking ID found");
      return;
    }

    try {
      const response = await axiosInstance.post("/payments/initiate", {
        bookingId,
        paymentMethod: "digital",
      });

      const { esewaData, gatewayUrl } = response.data.data;

      navigate("/dashboard/payment/esewa-redirect", {
        state: { esewaData, gatewayUrl, bookingId },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to retry payment");
    }
  };

  const handleSwitchToCash = async () => {
    if (!bookingId) {
      toast.error("No booking ID found");
      return;
    }

    setIsSwitchingToCash(true);
    try {
      await axiosInstance.post(
        `/bookings/individual/${bookingId}/update-payment-method`,
        { paymentMethod: "cash" }
      );

      toast.success("Switched to cash payment");
      navigate("/dashboard/orders");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to switch payment method");
    } finally {
      setIsSwitchingToCash(false);
    }
  };

  return (
    <PageLayout title="Payment Failed">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card className="border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-800">
              Payment Failed
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Your payment could not be processed
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Details */}
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                {decodeURIComponent(reason)}
              </AlertDescription>
            </Alert>

            {/* Booking Reference */}
            {bookingId && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Booking Reference</p>
                <p className="text-sm font-mono text-gray-900">
                  {String(bookingId).slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">What would you like to do?</h3>
              
              <Separator />

              {/* Retry Payment */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-blue-800">
                  Option 1: Retry Payment
                </h4>
                <p className="text-xs text-gray-600">
                  Try paying again via eSewa. A new transaction will be generated.
                </p>
                <Button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry eSewa Payment
                    </>
                  )}
                </Button>
              </div>

              {/* Switch to Cash */}
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-green-800">
                  Option 2: Pay with Cash
                </h4>
                <p className="text-xs text-gray-600">
                  Switch to cash payment and pay directly to the porter.
                </p>
                <Button
                  onClick={handleSwitchToCash}
                  disabled={isSwitchingToCash}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  {isSwitchingToCash ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-2" />
                      Switch to Cash Payment
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* View Orders */}
            <Button
              onClick={() => navigate("/dashboard/orders")}
              variant="outline"
              className="w-full"
            >
              View My Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PaymentFailure;
