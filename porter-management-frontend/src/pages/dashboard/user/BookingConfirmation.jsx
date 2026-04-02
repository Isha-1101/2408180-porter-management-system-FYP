import { useLocation, useNavigate } from "react-router-dom";
import { Weight, Calculator, CheckCircle2, Truck, Loader2 } from "lucide-react";
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
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import { getCloudinaryUrl } from "../../../utils/helper";
import { useCreateIndividualBooking } from "../../../apis/hooks/porterBookingsHooks";
import dayjs from "dayjs";
const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { porter, pickup, dropoff, weight, totalPrice } = location.state || {};

  const { mutateAsync: confirmBooking, isPending } =
    useCreateIndividualBooking();

  if (!porter) {
    navigate("/dashboard/booking");
    return null;
  }

  const handleConfirm = async () => {
    try {
      const res = await confirmBooking({
        pickup: {
          lat: pickup?.lat,
          lng: pickup?.lng,
          address: pickup?.address || "",
        },
        drop: {
          lat: dropoff?.lat,
          lng: dropoff?.lng,
          address: dropoff?.address || "",
        },
        weightKg: weight || 200,
        hasVehicle: porter.hasVehicle || false,
        vehicleType: porter.vehicleCategory || null,
        radiusKm: 5,
        totalPrice,
        bookingDate: dayjs().format("YYYY-MM-DD"),
        bookingTime: dayjs().format("HH:mm:ss"),
      });

      navigate("/dashboard/booking/tracking", {
        state: { bookingId: res?.data?.bookingId, pickup, dropoff, porter },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageLayout
      className="max-w-full p-4"
      title="Booking Confirmation"
    >
      <div className="flex flex-col  items-center">
        <Card className="w-3xl mt-2">
          <CardContent className="space-y-6">
            {/* Route */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                  <div className="w-0.5 h-10 bg-gray-200 my-1" />
                  <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Pickup
                    </p>
                    <AddressLine location={pickup} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Dropoff
                    </p>
                    <AddressLine location={dropoff} />
                  </div>
                </div>
              </div>
            </div>

            {/* Porter */}
            <div className="flex items-center gap-4 border p-4 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {porter.photo ? (
                  <img
                    src={getCloudinaryUrl(porter.photo)}
                    alt={porter.porterName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-lg">
                    {porter.porterName?.charAt(0) || "P"}
                  </span>
                )}
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
                <p className="font-bold text-xl text-primary">NPR 50</p>
                <p className="text-xs text-muted-foreground">Base Rate</p>
              </div>
            </div>

            {/* Weight */}
            <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-900 rounded-md border border-blue-100">
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5" />
                <span className="font-medium">Total Weight</span>
              </div>
              <span className="font-bold">{weight || 0} kg</span>
            </div>

            <Separator />

            {/* Vehicle */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" /> Vehicle Details
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has Vehicle</span>
                  <span>{porter.hasVehicle ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{porter.vehicleCategory ?? "N/A"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-2">
              {/* <h3 className="font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Payment Breakdown
              </h3> */}
              {/* <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Porter Base Fare
                  </span>
                  <span>NPR {50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Weight (
                    {extraWeight > 0
                      ? `${extraWeight}kg × ${pricePerKg}`
                      : "Included"}
                    )
                  </span>
                  <span>NPR {weightCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>NPR {serviceFee}</span>
                </div>
              </div> */}
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-2/3 gap-2"
              size="lg"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Confirming…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Confirm Booking
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BookingConfirmation;
