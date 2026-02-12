import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Weight,
  Calculator,
  User,
  CheckCircle2,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PageLayout from "../../../components/common/PageLayout";
import { getCloudinaryUrl } from "../../../utils/helper";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { porter, pickup, dropoff, weight } = location.state || {};

  useEffect(() => {
    if (!porter) {
      navigate("/dashboard/booking");
    }
  }, [porter, navigate]);

  if (!porter) return null;

  // Pricing Logic
  const basePrice = porter.price || 200;
  const weightVal = parseFloat(weight) || 0;

  // Example logic: Base price covers up to 10kg. Extra weight is 15 NPR/kg.
  const baseWeightLimit = 10;
  const pricePerKg = 15;
  const extraWeight = Math.max(0, weightVal - baseWeightLimit);
  const weightCharge = extraWeight * pricePerKg;

  const serviceFee = 40;
  const totalPrice = Math.round(basePrice + weightCharge + serviceFee);

  const handleConfirm = () => {
    // Navigate to payment page with booking data
    navigate("/dashboard/booking/payment", {
      state: {
        totalPrice,
        bookingDetails: {
          porter,
          pickup,
          dropoff,
          weight,
        },
      },
    });
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </Button>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              Booking Summary
            </CardTitle>
            <CardDescription>
              Review your shipment details and pricing
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Route Details */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                  <div className="w-0.5 h-10 bg-gray-200 mx-auto my-1" />
                  <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Pickup
                    </p>
                    <p className="font-medium">
                      {pickup || "Current Location"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Dropoff
                    </p>
                    <p className="font-medium">{dropoff}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Porter Info */}
            <div className="flex items-center gap-4 border p-4 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <img
                  src={getCloudinaryUrl(porter.photo)}
                  alt={porter.porterName}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{porter.porterName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium capitalize">
                    {porter.porterType} Porter
                  </span>
                  <span>•</span>
                  <span>{porter.rating} ★</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-primary">
                  NPR {basePrice}
                </p>
                <p className="text-xs text-muted-foreground">Base Rate</p>
              </div>
            </div>

            {/* Weight Details */}
            <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-900 rounded-md border border-blue-100">
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5" />
                <span className="font-medium">Total Weight</span>
              </div>
              <span className="font-bold">{weightVal} kg</span>
            </div>

            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle Details
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has Vehicle</span>
                  <span>{porter.hasVehicle ? "Yes" : "No"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Vehicle Category
                  </span>
                  <span>{porter.vehicleCategory ?? "N/A"}</span>
                </div>
              </div>
            </div>

            <Separator />
            {/* Price Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Payment Breakdown
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Porter Base Fare
                  </span>
                  <span>NPR {basePrice}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Weight Charge (
                    {extraWeight > 0
                      ? `${extraWeight}kg x NPR ${pricePerKg}`
                      : "Included"}
                    )
                  </span>
                  <span>NPR {weightCharge}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>NPR {serviceFee}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary text-2xl">NPR {totalPrice}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="w-full sm:w-1/3"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-2/3 gap-2"
              size="lg"
              onClick={handleConfirm}
            >
              <CheckCircle2 className="w-5 h-5" />
              Continue to Payment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BookingConfirmation;
