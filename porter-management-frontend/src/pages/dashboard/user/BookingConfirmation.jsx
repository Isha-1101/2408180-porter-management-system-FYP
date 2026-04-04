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
const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { porter, pickup, dropoff, weight, totalPrice, purpose, numberOfFloors, has_lift, hasVehicle, trip } = location.state || {};

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
        hasVehicle: hasVehicle || porter.hasVehicle || false,
        vehicleType: porter.vehicleCategory || null,
        radiusKm: 5,
        totalPrice,
        noOfFloors: numberOfFloors ? Number(numberOfFloors) : null,
        hasLift: has_lift || false,
        no_of_trips: trip ? Number(trip) : 1,
        purpose_of_booking: purpose || "transportation",
      });

      navigate("/dashboard/booking/tracking", {
        state: { bookingId: res?.data?.bookingId, pickup, dropoff, porter, fare: totalPrice },
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
            <div className="bg-[#F5FBF2] p-4 rounded-lg border border-[#C5E2B6]">
              <div className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-0.5 h-10 bg-[#C5E2B6] my-1" />
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-[#0C4C40] uppercase tracking-wider font-semibold mb-1">
                      Pickup
                    </p>
                    <AddressLine location={pickup} />
                  </div>
                  <div>
                    <p className="text-xs text-[#0C4C40] uppercase tracking-wider font-semibold mb-1">
                      Dropoff
                    </p>
                    <AddressLine location={dropoff} />
                  </div>
                </div>
              </div>
            </div>

            {/* Porter */}
            <div className="flex items-center gap-4 border border-[#C5E2B6] p-4 rounded-lg bg-[#F5FBF2]">
              <div className="w-12 h-12 bg-[#C5E2B6] rounded-full flex items-center justify-center overflow-hidden">
                {porter.photo ? (
                  <img
                    src={getCloudinaryUrl(porter.photo)}
                    alt={porter.porterName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#0C4C40] font-bold text-lg">
                    {porter.porterName?.charAt(0) || "P"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-[#0C4C40]">{porter.porterName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-[#C5E2B6] text-[#0C4C40] px-2 py-0.5 rounded text-xs font-medium capitalize">
                    {porter.porterType} Porter
                  </span>
                  <span>•</span>
                  <span>{porter.rating} ★</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-[#0C4C40]">NPR 50</p>
                <p className="text-xs text-muted-foreground">Base Rate</p>
              </div>
            </div>

            {/* Weight */}
            <div className="flex items-center justify-between p-3 bg-[#E8F5E8] text-[#0C4C40] rounded-md border border-[#C5E2B6]">
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5" />
                <span className="font-medium">Total Weight</span>
              </div>
              <span className="font-bold">{weight || 0} kg</span>
            </div>

            <Separator />

            {/* Vehicle */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-[#0C4C40]">
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
                <span className="text-[#0C4C40]">Total Amount</span>
                <span className="text-[#0C4C40] text-2xl">NPR {totalPrice}</span>
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
                "Confirm Booking"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BookingConfirmation;
