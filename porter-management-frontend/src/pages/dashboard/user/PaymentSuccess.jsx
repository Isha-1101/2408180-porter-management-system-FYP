import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/common/PageLayout";

/**
 * PaymentSuccess Page
 * 
 * Displayed after successful eSewa payment.
 * Shows transaction details and provides navigation to orders.
 * 
 * URL params: ?bookingId=xxx&transactionCode=xxx&amount=xxx
 */
export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const bookingId = searchParams.get("bookingId");
  const transactionCode = searchParams.get("transactionCode");
  const amount = searchParams.get("amount");

  // Auto-redirect to orders after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard/orders", {
            state: {
              promptRatingFor: bookingId ? { bookingId } : null,
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, bookingId]);

  const handleViewOrders = () => {
    navigate("/dashboard/orders", {
      state: {
        promptRatingFor: bookingId ? { bookingId } : null,
      },
    });
  };

  return (
    <PageLayout title="Payment Successful">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">
              Payment Successful!
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Your payment has been processed successfully
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Transaction Details
              </h3>
              <Separator className="bg-green-200" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Code</span>
                  <Badge variant="outline" className="font-mono">
                    {transactionCode || "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-green-800">
                    NPR {amount || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    eSewa Digital
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Confirmed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Booking Reference */}
            {bookingId && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Booking Reference</p>
                <p className="text-sm font-mono text-gray-900">
                  {String(bookingId).slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleViewOrders}
                className="w-full"
                size="lg"
              >
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                Auto-redirecting to orders in {countdown} seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PaymentSuccess;
