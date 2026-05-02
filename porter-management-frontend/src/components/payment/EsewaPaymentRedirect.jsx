import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * EsewaPaymentRedirect Component
 * 
 * Automatically submits a hidden form to eSewa payment gateway.
 * Receives eSewa form data via navigation state from previous page.
 * 
 * Expected navigation state:
 * - esewaData: Object containing all eSewa form fields
 * - gatewayUrl: eSewa payment gateway URL
 * - bookingId: Booking ID for reference
 */
export const EsewaPaymentRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [error, setError] = useState(null);

  const { esewaData, gatewayUrl, bookingId } = location.state || {};

  useEffect(() => {
    if (!esewaData || !gatewayUrl) {
      setError("Missing payment data. Please try again.");
      return;
    }

    // Auto-submit form after a brief delay to ensure render
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [esewaData, gatewayUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/dashboard/orders")}
              className="w-full"
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          </div>
          <CardTitle className="text-xl">Redirecting to eSewa</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Please wait while we redirect you to the eSewa payment gateway...
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500">Booking ID</p>
            <p className="text-sm font-mono text-gray-900">
              {String(bookingId || "").slice(-8).toUpperCase()}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            If you are not redirected automatically, please click the button below.
          </p>
          <Button
            onClick={() => formRef.current?.submit()}
            className="w-full"
          >
            Proceed to eSewa
          </Button>
        </CardContent>
      </Card>

      {/* Hidden eSewa Payment Form */}
      {esewaData && gatewayUrl && (
        <form
          ref={formRef}
          action={gatewayUrl}
          method="POST"
          style={{ display: "none" }}
        >
          <input type="hidden" name="amount" value={esewaData.amount} />
          <input type="hidden" name="tax_amount" value={esewaData.tax_amount || "0"} />
          <input type="hidden" name="total_amount" value={esewaData.total_amount} />
          <input type="hidden" name="transaction_uuid" value={esewaData.transaction_uuid} />
          <input type="hidden" name="product_code" value={esewaData.product_code} />
          <input type="hidden" name="product_service_charge" value={esewaData.product_service_charge || "0"} />
          <input type="hidden" name="product_delivery_charge" value={esewaData.product_delivery_charge || "0"} />
          <input type="hidden" name="success_url" value={esewaData.success_url} />
          <input type="hidden" name="failure_url" value={esewaData.failure_url} />
          <input type="hidden" name="signed_field_names" value={esewaData.signed_field_names} />
          <input type="hidden" name="signature" value={esewaData.signature} />
        </form>
      )}
    </div>
  );
};

export default EsewaPaymentRedirect;
