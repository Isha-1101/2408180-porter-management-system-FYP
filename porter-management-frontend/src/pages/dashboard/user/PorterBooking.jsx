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
  Loader,
  SearchIcon,
  Layers,
  Route,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";
import UserMap from "@/components/Map/UserMap";
import PageLayout from "@/components/common/PageLayout";
import {
  usecreatePorterBooking,
  useSearchNearByPorter,
} from "../../../apis/hooks/porterBookingsHooks";
import { useCreateTeamBooking } from "../../../apis/hooks/porterTeamHooks";
import { traverseInPorter } from "../../../utils/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FareEstimateBreakdown from "../../../components/common/FareEstimate";
import LocationAutocomplete from "@/components/common/LocationAutocomplete";

const PorterBooking = () => {
  const [pickup, setPickup] = useState({ address: "", lat: null, lng: null });
  const [dropoff, setDropoff] = useState({ address: "", lat: null, lng: null });
  const [selectingMapFor, setSelectingMapFor] = useState(null); // "pickup" | "dropoff" | null

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      return data.display_name;
    } catch (error) {
      console.error(error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleSetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = await reverseGeocode(lat, lng);
          setPickup({ address, lat, lng });
        },
        (error) => {
          console.error("Error getting location", error);
        },
      );
    }
  };

  const handleMapClick = async (latlng) => {
    if (!selectingMapFor) return;
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    if (selectingMapFor === "pickup") {
      setPickup({ address, lat: latlng.lat, lng: latlng.lng });
    } else {
      setDropoff({ address, lat: latlng.lat, lng: latlng.lng });
    }
    setSelectingMapFor(null);
  };
  const [weight, setWeight] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [numberOfVehicles, setNumberOfVehicles] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [porterType, setPorterType] = useState("individual"); // "individual" or "team"
  const [hasVehicle, setHasVehicle] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [porters, setPorters] = useState();
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [showFareBreakdown, setShowFareBreakdown] = useState(true);
  const [purpose, setPurpose] = useState("");
  const [hasLift, setHasLift] = useState(false);
  const [numberOfTrips, setNumberOfTrips] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [formError, setFormError] = useState("");

  // ── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!pickup.lat || !pickup.lng) return "Please select a pickup location.";
    if (!dropoff.lat || !dropoff.lng) return "Please select a drop-off location.";

    if (porterType === "individual") {
      if (!purpose) return "Please select a purpose of booking.";
      if (!weight || Number(weight) < 5) return "Weight must be at least 5 kg.";
      if (hasVehicle && !vehicleType) return "Please select a vehicle type.";
    }

    if (porterType === "team") {
      if (!teamSize || Number(teamSize) < 1) return "Number of porters must be at least 1.";
      if (!weight || Number(weight) < 5) return "Weight must be at least 5 kg.";
      if (!purpose) return "Please select a purpose of booking.";
      if (hasVehicle && !vehicleType) return "Please select a vehicle type.";
      if (hasVehicle && numberOfVehicles && Number(numberOfVehicles) < 1)
        return "Number of vehicles must be at least 1.";
      // booking date must be today or future
      if (bookingDate) {
        const selectedDate = new Date(bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return "Booking date must be today or a future date.";
      }
      if (bookingDate && !bookingTime) return "Please provide a booking time when a date is selected.";
    }

    return null;
  };

  // ── Mutation hooks ────────────────────────────────────────────────────────
  // Individual porter: search nearby, then book
  const {
    mutateAsync: searchNearByPorter,
    isPending: searchNearByPorterPending,
  } = useSearchNearByPorter();
  const {
    mutateAsync: createPorterBooking,
    isPending: createPorterBookingPending,
  } = usecreatePorterBooking();

  // Team porter: creates booking directly (no search step)
  const {
    mutateAsync: createTeamBooking,
    isPending: createTeamBookingPending,
  } = useCreateTeamBooking();

  const [vehicleType, setVehicleType] = useState(""); // "bike", "van", "mini-truck", "truck"

  const navigate = useNavigate();

  /**
   * handleSearch:
   *  - Individual: searches nearby porters and shows available list.
   *  - Team: creates the booking directly and navigates to tracking page.
   */
  const handleSearch = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");

    // ── Team Porter: direct booking creation ──────────────────────────────
    if (porterType === "team") {
      try {
        const res = await createTeamBooking({
          pickup: {
            lat: pickup.lat,
            lng: pickup.lng,
            address: pickup.address || "",
          },
          drop: {
            lat: dropoff.lat,
            lng: dropoff.lng,
            address: dropoff.address || "",
          },
          weightKg: Number(weight),
          teamSize: Number(teamSize),
          requirements: requirements || null,
          bookingDate: bookingDate || null,
          bookingTime: bookingTime || null,
          hasVehicle,
          vehicleType: hasVehicle ? vehicleType : null,
          numberOfVehicles: hasVehicle ? Number(numberOfVehicles) : null,
          purpose_of_booking: purpose || "transportation",
          noOfFloors: numberOfFloors ? Number(numberOfFloors) : null,
          hasLift: hasLift,
          no_of_trips: numberOfTrips ? Number(numberOfTrips) : null,
        });

        // Navigate user to the real-time team booking tracking page
        navigate("/dashboard/booking/team-tracking", {
          state: { bookingId: res?.bookingId || res?.data?.bookingId },
        });
      } catch (error) {
        // error toast handled in hook
        console.error("Team booking error:", error);
      }
      return;
    }

    // ── Individual Porter: search nearby porters ───────────────────────────
    try {
      const res = await searchNearByPorter({
        bookingType: porterType,
        pickup: {
          lat: pickup.lat,
          lng: pickup.lng,
          address: pickup.address || "",
        },
        dropoff: {
          lat: dropoff.lat,
          lng: dropoff.lng,
          address: dropoff.address || "",
        },
        weightKg: weight,
        hasVehicle: hasVehicle,
        vehicleType: hasVehicle ? vehicleType : null,
        purpose: purpose,
        no_of_floors: numberOfFloors,
        has_lift: hasLift,
        hasVehicle: hasVehicle,
        trip: numberOfTrips,
      });
      const actualPorter = traverseInPorter(res?.data?.data);
      setPorters(actualPorter);
      setHasSearched(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBookPorter = async (porter) => {
    navigate("/dashboard/booking/confirmation", {
      state: {
        porterId: porter.id,
        porter,
        pickup,
        dropoff,
        weight,
        teamSize: porterType === "team" ? teamSize : null,
        requirements: porterType === "team" ? requirements : null,
        bookingDate: porterType === "team" ? bookingDate : null,
        bookingTime: porterType === "team" ? bookingTime : null,
        vehicleType: hasVehicle ? vehicleType : null,
        numberOfVehicles:
          porterType === "team" && hasVehicle ? numberOfVehicles : null,
        purpose: purpose,
        numberOfFloors: numberOfFloors,
        has_lift: hasLift,
        hasVehicle: hasVehicle,
        trip: numberOfTrips,
        totalPrice,
      },
    });
  };

  return (
    <PageLayout className="">
      <div className="flex flex-col gap-1">
        {/* Map Section - Full Width */}
        <div className="relative w-full h-[400px] md:h-[350px] not-only:overflow-hidden shadow-sm">
          {selectingMapFor && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-white px-4 py-2 rounded-full shadow-md font-medium text-sm text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Click on the map to set{" "}
              {selectingMapFor === "pickup" ? "Pickup" : "Dropoff"} location
              <button
                onClick={() => setSelectingMapFor(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
          )}
          <UserMap
            showSidebar={false}
            onMapClick={handleMapClick}
            pickupLocation={pickup}
            dropoffLocation={dropoff}
            className={selectingMapFor ? "cursor-crosshair" : ""}
          />
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
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${
                      porterType === "individual"
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Individual Porter
                  </button>
                  <button
                    onClick={() => setPorterType("team")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${
                      porterType === "team"
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
                      <LocationAutocomplete
                        id="from-location"
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={(newVal) => setPickup(newVal)}
                        icon={MapPin}
                        className="pl-9 pr-16"
                        inputRightButtons={
                          <>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectingMapFor(
                                    selectingMapFor === "pickup"
                                      ? null
                                      : "pickup",
                                  )
                                }
                                className={`p-1.5 rounded-full transition-colors ${selectingMapFor === "pickup" ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-500"}`}
                                title="Select from map"
                              >
                                <MapPin className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleSetCurrentLocation}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                              title="Use current location"
                            >
                              <Crosshair className="w-4 h-4" />
                            </button>
                          </>
                        }
                      />
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
                      <LocationAutocomplete
                        id="to-location"
                        placeholder="Destination"
                        value={dropoff}
                        onChange={(newVal) => setDropoff(newVal)}
                        icon={Navigation}
                        className="pl-9 pr-10"
                        inputRightButtons={
                          <button
                            type="button"
                            onClick={() =>
                              setSelectingMapFor(
                                selectingMapFor === "dropoff"
                                  ? null
                                  : "dropoff",
                              )
                            }
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${selectingMapFor === "dropoff" ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-500"}`}
                            title="Select from map"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        }
                      />
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
                        <p className="text-xs text-gray-500">
                          Porter with vehicle assistance
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setHasVehicle(!hasVehicle)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVehicle ? "bg-primary" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVehicle ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {/* Vehicle Type Selection (Only when hasVehicle is true) */}
                  {hasVehicle && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Vehicle Type
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "bike", label: "Bike", icon: Bike },
                          { id: "van", label: "Van", icon: Car },
                          {
                            id: "mini-truck",
                            label: "Mini Truck",
                            icon: Truck,
                          },
                          { id: "truck", label: "Truck", icon: Package2 },
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setVehicleType(type.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                              vehicleType === type.id
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
                          <Label
                            htmlFor="numberOfVehicles"
                            className="text-sm font-medium text-gray-700"
                          >
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

                {/* {purpose of booking} */}
                {!hasVehicle && (
                  <div className="space-y-4">
                    <div className="max-w-full">
                      <Label
                        htmlFor="purpose"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Purpose of Booking
                      </Label>
                      <Select
                        id="purpose"
                        value={purpose}
                        onValueChange={(e) => setPurpose(e)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transportation">
                            Transportation
                          </SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {purpose && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        {/* Weight Input */}
                        <div className="space-y-2">
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

                        {/* Number of Trips Input */}
                        <div className="space-y-2">
                          <label
                            htmlFor="numberOfTrips"
                            className="text-sm font-medium flex items-center gap-2 text-gray-700"
                          >
                            <Route className="w-4 h-4 text-primary" />
                            Number of Trips
                          </label>
                          <div className="relative">
                            <input
                              id="numberOfTrips"
                              type="number"
                              placeholder="e.g. 1"
                              value={numberOfTrips}
                              min="1"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || parseInt(val) >= 1)
                                  setNumberOfTrips(val);
                              }}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              <Route className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {purpose === "transportation" && (
                          <>
                            {/* Number of Floors */}
                            <div className="space-y-2">
                              <label
                                htmlFor="floors"
                                className="text-sm font-medium flex items-center gap-2 text-gray-700"
                              >
                                <Layers className="w-4 h-4 text-primary" />
                                Number of Floors
                              </label>
                              <div className="relative">
                                <input
                                  id="floors"
                                  type="number"
                                  placeholder="e.g. 4"
                                  value={numberOfFloors}
                                  min="0"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || parseInt(val) >= 0)
                                      setNumberOfFloors(val);
                                  }}
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <Layers className="w-4 h-4" />
                                </div>
                              </div>
                            </div>

                            {/* Has Lift */}
                            <div className="space-y-2 h-[68px] flex flex-col justify-end">
                              <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-gray-700">
                                    Elevator / Lift available?
                                  </p>
                                </div>
                                <button
                                  onClick={() => setHasLift(!hasLift)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasLift ? "bg-primary" : "bg-gray-300"}`}
                                  type="button"
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasLift ? "translate-x-6" : "translate-x-1"}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Team-specific fields ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Team Size Input (Only for Team Porter) */}
                  {porterType === "team" && (
                    <div className="md:col-span-6 space-y-2">
                      <Label
                        htmlFor="teamSize"
                        className="text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        <UserPlus className="w-4 h-4 text-primary" />
                        Number of Porters <span className="text-red-500">*</span>
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

                  {/* Weight — always visible for team, shown by purpose for individual */}
                  {porterType === "team" && (
                    <div className="md:col-span-6 space-y-2">
                      <Label
                        htmlFor="weight-team"
                        className="text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        <Weight className="w-4 h-4 text-primary" />
                        Weight (kg) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="weight-team"
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
                          className="pl-9 pr-12"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Weight className="w-4 h-4" />
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium pointer-events-none bg-gray-100 px-2 py-1 rounded">
                          kg
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Purpose of Booking — always visible for team */}
                  {porterType === "team" && (
                    <div className="md:col-span-12 space-y-2">
                      <Label
                        htmlFor="purpose-team"
                        className="text-sm font-medium text-gray-700"
                      >
                        Purpose of Booking <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="purpose-team"
                        value={purpose}
                        onValueChange={(e) => setPurpose(e)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transportation">
                            🚚 Transportation (Moving / House Shift)
                          </SelectItem>
                          <SelectItem value="delivery">📦 Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Transportation extras for team — floors & lift */}
                  {porterType === "team" && purpose === "transportation" && (
                    <>
                      <div className="md:col-span-6 space-y-2">
                        <label
                          htmlFor="floors-team"
                          className="text-sm font-medium flex items-center gap-2 text-gray-700"
                        >
                          <Layers className="w-4 h-4 text-primary" />
                          Number of Floors
                        </label>
                        <div className="relative">
                          <input
                            id="floors-team"
                            type="number"
                            placeholder="e.g. 4"
                            value={numberOfFloors}
                            min="0"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || parseInt(val) >= 0)
                                setNumberOfFloors(val);
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Layers className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-6 space-y-2 h-[68px] flex flex-col justify-end">
                        <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-700">
                              Elevator / Lift available?
                            </p>
                          </div>
                          <button
                            onClick={() => setHasLift(!hasLift)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasLift ? "bg-primary" : "bg-gray-300"}`}
                            type="button"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasLift ? "translate-x-6" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Number of trips for team */}
                  {porterType === "team" && purpose && (
                    <div className="md:col-span-6 space-y-2">
                      <label
                        htmlFor="numberOfTrips-team"
                        className="text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        <Route className="w-4 h-4 text-primary" />
                        Number of Trips
                      </label>
                      <div className="relative">
                        <input
                          id="numberOfTrips-team"
                          type="number"
                          placeholder="e.g. 1"
                          value={numberOfTrips}
                          min="1"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseInt(val) >= 1)
                              setNumberOfTrips(val);
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Route className="w-4 h-4" />
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
                        Special Requirements
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
                          Booking Date <span className="text-red-500">*</span>
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

                {/* ── Fare Estimate Breakdown ── */}
                {hasSearched && (
                  <FareEstimateBreakdown
                    numberOfFloors={numberOfFloors}
                    hasLift={hasLift}
                    numberOfTrips={numberOfTrips}
                    hasVehicle={hasVehicle}
                    vehicleType={vehicleType}
                    weight={weight}
                    showFareBreakdown={showFareBreakdown}
                    setShowFareBreakdown={setShowFareBreakdown}
                    setTotalPrice={setTotalPrice}
                  />
                )}

                {/* Validation error banner */}
                {formError && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v4a1 1 0 01-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Search / Book Button */}
                <div className="pt-2 flex justify-center">
                  <Button
                    className="w-full md:w-auto px-12 h-10 font-medium text-base shadow-sm hover:shadow active:scale-[0.98] transition-all bg-[#D35400] hover:bg-[#A04000] text-white"
                    onClick={handleSearch}
                    disabled={
                      porterType === "team"
                        ? createTeamBookingPending
                        : searchNearByPorterPending
                    }
                  >
                    {/* Show spinner while team booking is being created */}
                    {porterType === "team" && createTeamBookingPending && (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    {porterType === "team"
                      ? "Book Team Porter"
                      : "Find Porters"}
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
                      ({hasSearched ? porters.length : 0})
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 h-[400px] overflow-y-auto custom-scrollbar">
                {searchNearByPorterPending ? (
                  <div className="flex flex-col items-center justify-center p-8 max-w-sm mx-auto">
                    <div className="relative">
                      <SearchIcon className="w-10 h-10 text-primary animate-pulse" />
                      {/* Optional pulsing ring effect */}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full border-2 border-primary/30 animate-ping absolute" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-700 tracking-wide">
                      Searching{" "}
                      <span className="text-primary font-bold">Porter</span>
                      <span className="inline-flex ml-1">
                        <span className="animate-bounce delay-0">.</span>
                        <span className="animate-bounce delay-150">.</span>
                        <span className="animate-bounce delay-300">.</span>
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                      Please wait a moment
                    </p>
                  </div>
                ) : hasSearched ? (
                  <AvailablePorter
                    availablePorters={porters}
                    onBook={handleBookPorter}
                    isLoadingPorter={searchNearByPorterPending}
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
