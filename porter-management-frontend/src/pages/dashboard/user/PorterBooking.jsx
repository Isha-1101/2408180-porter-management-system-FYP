import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  User,
  UserPlus,
  Crosshair,
  Weight,
  Search,
  Footprints,
  Bike,
  Car,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";
import UserMap from "@/components/Map/UserMap";
import PageLayout from "@/components/common/PageLayout";
// import PageLayout from "../../../components/common/PageLayout";

const PorterBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight, setWeight] = useState("");
  const [porterType, setPorterType] = useState("individual"); // "individual" or "team"
  const [hasSearched, setHasSearched] = useState(false);
  const [calculatedPriceMultiplier, setCalculatedPriceMultiplier] = useState(1);

  const porters = useMemo(
    () => [
      {
        id: "p-101",
        name: "Ramesh Tamang",
        rating: 4.8,
        completed: 312,
        etaMin: 12,
        basePrice: 220,
        type: "individual",
        tags: ["Fast", "Nearby"],
      },
      {
        id: "p-102",
        name: "Sita Gurung",
        rating: 4.9,
        completed: 540,
        etaMin: 18,
        basePrice: 260,
        type: "individual",
        tags: ["Top Rated"],
      },
      {
        id: "p-103",
        name: "Team Alpha",
        rating: 4.6,
        completed: 190,
        etaMin: 9,
        basePrice: 450,
        type: "team",
        tags: ["Team", "Heavy Load"],
      },
      {
        id: "p-104",
        name: "Bikash Karki",
        rating: 4.7,
        completed: 260,
        etaMin: 22,
        basePrice: 340,
        type: "individual",
        tags: ["Experienced"],
      },
      {
        id: "p-105",
        name: "Team Bravo",
        rating: 4.8,
        completed: 310,
        etaMin: 15,
        basePrice: 500,
        type: "team",
        tags: ["Team", "Fast Service"],
      },
    ],
    [],
  );

  const filteredPorters = useMemo(() => {
    return porters
      .filter((p) => p.type === porterType)
      .map((p) => ({
        ...p,
        price: Math.round(p.basePrice * calculatedPriceMultiplier),
      }));
  }, [porters, porterType, calculatedPriceMultiplier]);

  const [vehicleType, setVehicleType] = useState("none"); // "none", "two-wheeler", "four-wheeler"

  const navigate = useNavigate();

  const handleSearch = () => {
    // Mock price calculation logic
    // In a real app, this would use distance from the map/API
    if (pickup && dropoff) {
      setHasSearched(true);
      // random multiplier between 1.1 and 1.5 to simulate "calculated price"
      setCalculatedPriceMultiplier(1.1 + Math.random() * 0.4);
    } else {
      // Just show them anyway if fields are empty, or validation could go here
      setHasSearched(true);
      setCalculatedPriceMultiplier(1);
    }
  };

  const handleBookPorter = (porter) => {
    navigate("/dashboard/booking/confirmation", {
      state: {
        porter,
        pickup,
        dropoff,
        weight,
        vehicleType,
      },
    });
  };

  return (
    <PageLayout className="">
      <div className="flex flex-col gap-1">
        {/* Map Section - Full Width */}
        <div className="w-full h-[400px] md:h-[500px] not-only:overflow-hidden shadow-sm">
          <UserMap showSidebar={false} />
        </div>

        {/* Search & Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-3">
          {/* Left: Inputs */}
          <div className="lg:col-span-8">
            <Card className="rounded-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Find Your Porter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vehicle Category Selection */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { id: "none", label: "No vehicles", icon: Footprints },
                    { id: "two-wheeler", label: "Two wheelers", icon: Bike },
                    { id: "four-wheeler", label: "Four Wheelers", icon: Car },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setVehicleType(type.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${vehicleType === type.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Location */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="from-location"
                      className="text-sm font-medium flex items-center gap-2 text-gray-700"
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      From
                    </Label>
                    <div className="relative">
                      <Input
                        id="from-location"
                        type="text"
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="pl-9"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        title="Use current location"
                      >
                        <Crosshair className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* To Location */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="to-location"
                      className="text-sm font-medium flex items-center gap-2 text-gray-700"
                    >
                      <Navigation className="w-4 h-4 text-primary" />
                      To
                    </Label>
                    <div className="relative">
                      <Input
                        id="to-location"
                        type="text"
                        placeholder="Destination"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        className="pl-9"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Navigation className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Weight Input */}
                  <div className="md:col-span-12 space-y-2">
                    <Label
                      htmlFor="weight"
                      className="text-sm font-medium flex items-center gap-2 text-gray-700"
                    >
                      <Weight className="w-4 h-4 text-primary" />
                      Weight (kg)
                    </Label>
                    <div className="relative">
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Min 5kg"
                        value={weight}
                        min="5"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseFloat(val) >= 0) {
                            setWeight(val);
                          }
                        }}
                        className="pl-9"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Weight className="w-4 h-4" />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium pointer-events-none bg-gray-100 px-2 py-1 rounded">
                        kg
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="pt-4 flex justify-center">
                  <Button
                    className="w-full md:w-auto px-12 h-10 font-medium text-base shadow-sm hover:shadow active:scale-[0.98] transition-all bg-[#D35400] hover:bg-[#A04000] text-white"
                    onClick={handleSearch}
                  >
                    Find Porters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Available Porters / Info */}
          <div className="lg:col-span-4">
            <Card className="h-full shadow-sm">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">
                    Available Porters{" "}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ({hasSearched ? filteredPorters.length : 0})
                    </span>
                  </CardTitle>
                </div>

                {/* Porter Type Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full">
                  <button
                    onClick={() => setPorterType("individual")}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${porterType === "individual"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setPorterType("team")}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${porterType === "team"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Team
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-3 h-[400px] overflow-y-auto custom-scrollbar">
                {hasSearched ? (
                  <AvailablePorter
                    availablePorters={filteredPorters}
                    onBook={handleBookPorter}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Search className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">Enter details to find porters</p>
                    <p className="text-xs mt-1 opacity-70">
                      Fill in pickup and dropoff locations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PorterBooking;
