
import { useMemo, useState } from "react";
import { MapPin, Navigation, User, UserPlus, Crosshair, Weight, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";
import UserMap from "@/components/Map/UserMap";
import PageLayout from "../../../components/common/PageLayout";

const PorterBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight, setWeight] = useState("");
  const [porterType, setPorterType] = useState("individual"); // "individual" or "team"

  const [selectedPorter, setSelectedPorter] = useState(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const porters = useMemo(
    () => [
      {
        id: "p-101",
        name: "Ramesh Tamang",
        rating: 4.8,
        completed: 312,
        etaMin: 12,
        price: 220,
        type: "individual",
        tags: ["Fast", "Nearby"],
      },
      {
        id: "p-102",
        name: "Sita Gurung",
        rating: 4.9,
        completed: 540,
        etaMin: 18,
        price: 260,
        type: "individual",
        tags: ["Top Rated"],
      },
      {
        id: "p-103",
        name: "Team Alpha",
        rating: 4.6,
        completed: 190,
        etaMin: 9,
        price: 450,
        type: "team",
        tags: ["Team", "Heavy Load"],
      },
      {
        id: "p-104",
        name: "Bikash Karki",
        rating: 4.7,
        completed: 260,
        etaMin: 22,
        price: 340,
        type: "individual",
        tags: ["Experienced"],
      },
      {
        id: "p-105",
        name: "Team Bravo",
        rating: 4.8,
        completed: 310,
        etaMin: 15,
        price: 500,
        type: "team",
        tags: ["Team", "Fast Service"],
      },
    ],
    [],
  );

  const filteredPorters = useMemo(() => {
    return porters.filter((p) => p.type === porterType);
  }, [porters, porterType]);

  const handleBookPorter = (porter) => {
    setSelectedPorter(porter);
    setIsBookingDialogOpen(true);
  };

  const handleConfirmBooking = () => {
    // Handle booking logic here
    console.log("Booking confirmed", {
      porter: selectedPorter,
      pickup,
      dropoff,
      weight
    });
    setIsBookingDialogOpen(false);
  };

  return (
    <PageLayout className="space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Map Section - Expanded */}
        <div className="lg:col-span-9">
          <Card className="h-full">
            <CardContent className="p-0 h-[600px] lg:h-full">
              <UserMap showSidebar={false} />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Available Porters & Filter */}
        <div className="hidden lg:block lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b space-y-3">
              <div>
                <CardTitle className="text-lg">
                  Available Porters
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPorters.length} {porterType} porter{filteredPorters.length !== 1 ? "s" : ""} nearby
                </p>
              </div>

              {/* Porter Type Selection - Moved here */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={porterType === "individual" ? "default" : "outline"}
                    className="w-full text-xs"
                    onClick={() => setPorterType("individual")}
                  >
                    <User className="w-3 h-3 mr-1" />
                    Individual
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={porterType === "team" ? "default" : "outline"}
                    className="w-full text-xs"
                    onClick={() => setPorterType("team")}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Team
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 overflow-y-auto">
              {filteredPorters.length > 0 ? (
                <AvailablePorter availablePorters={filteredPorters} onBook={handleBookPorter} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No porters nearby</p>
                  <p className="text-xs text-gray-500 mt-1">Try changing filter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedPorter?.name}</DialogTitle>
            <DialogDescription>
              Enter shipment details to proceed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="from-location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                From Location
              </Label>
              <div className="relative">
                <Input
                  id="from-location"
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  title="Use current location"
                >
                  <Crosshair className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="to-location" className="text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4 text-gray-500" />
                To Location
              </Label>
              <Input
                id="to-location"
                type="text"
                placeholder="Enter destination"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>

            {/* Weight Details */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
                <Weight className="w-4 h-4 text-gray-500" />
                Weight Details
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter weight (kg) - Min 5kg"
                  value={weight}
                  min="5"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      setWeight(val);
                    }
                  }}
                  className="pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  kg
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default PorterBooking;
