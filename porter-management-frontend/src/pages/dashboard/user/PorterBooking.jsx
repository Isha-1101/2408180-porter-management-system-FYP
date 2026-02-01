import { useMemo, useState } from "react";
import { MapPin, Navigation, User, UserPlus, Crosshair } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";
import UserMap from "@/components/Map/UserMap";
import PageLayout from "../../../components/common/PageLayout";

const PorterBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [porterType, setPorterType] = useState("individual"); // "individual" or "team"

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

  return (
    <PageLayout className="space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side - Route Planning */}
        <div className="lg:col-span-3 space-y-4">
          {/* Route Planning Card */}
          <Card>
            <CardContent className="space-y-4 pt-6">
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

              {/* Porter Type Selection */}
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Porter Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={porterType === "individual" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setPorterType("individual")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Individual
                  </Button>
                  <Button
                    type="button"
                    variant={porterType === "team" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setPorterType("team")}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Team
                  </Button>
                </div>
              </div>

              {/* Empty State for No Porters */}
              {filteredPorters.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No porters nearby</p>
                  <p className="text-xs text-gray-500 mt-1">Try entering a location</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Porters Card - Mobile/Small screens */}
          {filteredPorters.length > 0 && (
            <Card className="lg:hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  Available Porters ({filteredPorters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[400px] overflow-y-auto">
                <AvailablePorter availablePorters={filteredPorters} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle - Map Section */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardContent className="p-0 h-[600px] lg:h-full">
              <UserMap showSidebar={false} />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Available Porters (Desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                Available Porters
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                {filteredPorters.length} {porterType} porter{filteredPorters.length !== 1 ? "s" : ""} nearby
              </p>
            </CardHeader>
            <CardContent className="flex-1 p-2 overflow-y-auto">
              {filteredPorters.length > 0 ? (
                <AvailablePorter availablePorters={filteredPorters} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No porters nearby</p>
                  <p className="text-xs text-gray-500 mt-1">Try entering a location above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default PorterBooking;
