import { useMemo, useState } from "react";
import { MapPin, Users, Maximize2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";
import UserMap from "@/components/Map/UserMap";
import PageHeader from "../../../components/common/PageHeader";
import PageLayout from "../../../components/common/PageLayout";

const PorterBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicle, setVehicle] = useState("bike");
  const [service, setService] = useState("standard");
  const [maxPrice, setMaxPrice] = useState(500);
  const [isPorterDialogOpen, setIsPorterDialogOpen] = useState(false);

  const porters = useMemo(
    () => [
      {
        id: "p-101",
        name: "Ramesh Tamang",
        rating: 4.8,
        completed: 312,
        etaMin: 12,
        price: 220,
        vehicle: "bike",
        tags: ["Fast", "Nearby"],
      },
      {
        id: "p-102",
        name: "Sita Gurung",
        rating: 4.9,
        completed: 540,
        etaMin: 18,
        price: 260,
        vehicle: "bike",
        tags: ["Top Rated"],
      },
      {
        id: "p-103",
        name: "Amit Shrestha",
        rating: 4.6,
        completed: 190,
        etaMin: 9,
        price: 200,
        vehicle: "bike",
        tags: ["Cheapest"],
      },
      {
        id: "p-104",
        name: "Bikash Karki",
        rating: 4.7,
        completed: 260,
        etaMin: 22,
        price: 340,
        vehicle: "bike",
        tags: ["Heavy Load"],
      },
    ],
    [],
  );

  const filteredPorters = useMemo(() => {
    return porters
      .filter((p) => (vehicle ? p.vehicle === vehicle : true))
      .filter((p) => p.price <= maxPrice);
  }, [porters, vehicle, maxPrice]);

  return (
    <PageLayout
      className="space-y-4"
      title={"Porter Booking"}
      description={
        "Book a porter, choose service options, and assign instantly."
      }
      headerExtraChildren={
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            {filteredPorters.length} available
          </span>
        </div>
      }
    >
      {/* Main Content Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Map Section */}
        <div className="sm:col-span-4 md:col-span-4 lg:col-span-3 bg-background rounded-2xl p-2">
          <div className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Live Map</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Real-time porter locations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <UserMap showSidebar={true} />
            </CardContent>
          </div>
        </div>

        {/* Available Porters Section */}
        <div className="sm:col-span-4 md:col-span-4 lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Available Porters</CardTitle>
                  <CardDescription>
                    Your nearest porters are ready
                  </CardDescription>
                </div>
                <Dialog
                  open={isPorterDialogOpen}
                  onOpenChange={setIsPorterDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Expand porter list"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>All Available Porters</DialogTitle>
                      <DialogDescription>
                        {filteredPorters.length} porter
                        {filteredPorters.length !== 1 ? "s" : ""} available in
                        your area
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <AvailablePorter availablePorters={filteredPorters} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-1 border max-h-[calc(100vh-200px)] overflow-y-auto">
              <AvailablePorter availablePorters={filteredPorters} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default PorterBooking;
