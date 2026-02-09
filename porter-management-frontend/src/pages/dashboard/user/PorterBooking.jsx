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
  Truck,
  Package2,
  CalendarDays,
  Clock,
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
  const [teamSize, setTeamSize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [numberOfVehicles, setNumberOfVehicles] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [porterType, setPorterType] = useState("individual"); // "individual" or "team"
  const [hasVehicle, setHasVehicle] = useState(false);
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

  const [vehicleType, setVehicleType] = useState("bike"); // "bike", "van", "mini-truck", "truck"

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
        teamSize: porterType === "team" ? teamSize : null,
        requirements: porterType === "team" ? requirements : null,
        bookingDate: porterType === "team" ? bookingDate : null,
        bookingTime: porterType === "team" ? bookingTime : null,
        vehicleType: hasVehicle ? vehicleType : null,
        numberOfVehicles: porterType === "team" && hasVehicle ? numberOfVehicles : null,
      },
    });
  };

  return (
    <PageLayout className="">
      <div className="flex flex-col gap-1">
        {/* Map Section - Full Width */}
        <div className="w-full h-[400px] md:h-[350px] not-only:overflow-hidden shadow-sm">
          <UserMap showSidebar={false} />
        </div>

        {/* Search & Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-3">
          {/* Left: Inputs */}
          <div className="lg:col-span-8">
            <Card className="rounded-4">
              <CardHeader className="pb-3">
                <div className="flex bg-gray-100 p-1.5 rounded-lg w-full">
                  <button
                    onClick={() => setPorterType("individual")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${porterType === "individual"
                      ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                      }`}
                  >
                    <User className="w-4 h-4" />
                    Individual Porter
                  </button>
                  <button
                    onClick={() => setPorterType("team")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${porterType === "team"
                      ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                      }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Team Porter
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  {/* Weight Input */}
                  <div className={`${porterType === "team" ? "md:col-span-6" : "md:col-span-12"} space-y-2`}>
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

                  {/* Vehicle Toggle */}
                  <div className="md:col-span-12 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">Include Vehicle</p>
                          </div>
                          <p className="text-xs text-gray-500">Porter with vehicle assistance</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setHasVehicle(!hasVehicle)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVehicle ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVehicle ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Vehicle Type Selection (Only when hasVehicle is true) */}
                    {hasVehicle && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Select Vehicle Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "bike", label: "Bike", icon: Bike },
                            { id: "van", label: "Van", icon: Car },
                            { id: "mini-truck", label: "Mini Truck", icon: Truck },
                            { id: "truck", label: "Truck", icon: Package2 },
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

                        {/* Number of Vehicles (Only for Team Porter) */}
                        {porterType === "team" && (
                          <div className="space-y-2 mt-3">
                            <Label htmlFor="numberOfVehicles" className="text-sm font-medium text-gray-700">
                              Number of Vehicles
                            </Label>
                            <Input
                              id="numberOfVehicles"
                              type="number"
                              placeholder="Ex: 2"
                              value={numberOfVehicles}
                              min="1"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || parseFloat(val) >= 1) {
                                  setNumberOfVehicles(val);
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team Size Input (Only for Team Porter) */}
                  {porterType === "team" && (
                    <div className="md:col-span-6 space-y-2">
                      <Label
                        htmlFor="teamSize"
                        className="text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        <UserPlus className="w-4 h-4 text-primary" />
                        Number of Porters
                      </Label>
                      <div className="relative">
                        <Input
                          id="teamSize"
                          type="number"
                          placeholder="Ex: 3"
                          value={teamSize}
                          min="1"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseFloat(val) >= 1) {
                              setTeamSize(val);
                            }
                          }}
                          className="pl-9"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <UserPlus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requirements Input (Only for Team Porter) */}
                  {porterType === "team" && (
                    <div className="md:col-span-12 space-y-2">
                      <Label
                        htmlFor="requirements"
                        className="text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        <Search className="w-4 h-4 text-primary" />
                        Requirements
                      </Label>
                      <textarea
                        id="requirements"
                        placeholder="Describe your specific requirements (e.g., heavy lifting, specialized equipment needed)..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  )}

                  {/* Booking Date & Time (Only for Team Porter) */}
                  {porterType === "team" && (
                    <>
                      <div className="md:col-span-6 space-y-2">
                        <Label
                          htmlFor="bookingDate"
                          className="text-sm font-medium flex items-center gap-2 text-gray-700"
                        >
                          <CalendarDays className="w-4 h-4 text-primary" />
                          Booking Date
                        </Label>
                        <Input
                          id="bookingDate"
                          type="date"
                          value={bookingDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-2">
                        <Label
                          htmlFor="bookingTime"
                          className="text-sm font-medium flex items-center gap-2 text-gray-700"
                        >
                          <Clock className="w-4 h-4 text-primary" />
                          Booking Time
                        </Label>
                        <Input
                          id="bookingTime"
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
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
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Available Porters{" "}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ({hasSearched ? filteredPorters.length : 0})
                    </span>
                  </CardTitle>
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
