import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/common/PageLayout";
import FareEstimateBreakdown from "@/components/common/FareEstimate";
import {
  usecreatePorterBooking,
  useSearchNearByPorter,
} from "@/apis/hooks/porterBookingsHooks";
import { useCreateTeamBooking } from "@/apis/hooks/porterTeamHooks";
import { traverseInPorter } from "@/utils/helper";
import { VEHICLE_MAX_WEIGHT } from "./VehicleSelector";

const haversineKm = (pickup, drop) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(drop.lat - pickup.lat);
  const dLon = toRad(drop.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(drop.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

import BookingMap from "./BookingMap";
import BookingTypeToggle from "./BookingTypeToggle";
import LocationInputs from "./LocationInputs";
import VehicleSelector from "./VehicleSelector";
import PurposeFields from "./PurposeFields";
import TeamFields from "./TeamFields";
import PorterList from "./PorterList";

const PorterBooking = () => {
  const navigate = useNavigate();

  // ── Location state ────────────────────────────────────────────────────────
  const [pickup, setPickup] = useState({ address: "", lat: null, lng: null });
  const [dropoff, setDropoff] = useState({ address: "", lat: null, lng: null });
  const [selectingMapFor, setSelectingMapFor] = useState(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [porterType, setPorterType] = useState("individual");
  const [weight, setWeight] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [numberOfVehicles, setNumberOfVehicles] = useState("");

  // Auto-set weight when vehicle type is selected
  const handleVehicleTypeChange = (type) => {
    setVehicleType(type);
    if (type && VEHICLE_MAX_WEIGHT[type]) {
      setWeight(String(VEHICLE_MAX_WEIGHT[type]));
    }
  };

  // Computed distance between pickup and dropoff (km)
  const distanceKm = useMemo(() => {
    if (pickup.lat && pickup.lng && dropoff.lat && dropoff.lng) {
      return Number(haversineKm(pickup, dropoff).toFixed(2));
    }
    return 0;
  }, [pickup, dropoff]);
  const [purpose, setPurpose] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [hasLift, setHasLift] = useState(false);
  const [numberOfTrips, setNumberOfTrips] = useState("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [hasSearched, setHasSearched] = useState(false);
  const [porters, setPorters] = useState([]);
  const [showFareBreakdown, setShowFareBreakdown] = useState(true);
  const [totalPrice, setTotalPrice] = useState("");
  const [formError, setFormError] = useState("");

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { mutateAsync: searchNearByPorter, isPending: searchNearByPorterPending } = useSearchNearByPorter();
  const { mutateAsync: createPorterBooking, isPending: createPorterBookingPending } = usecreatePorterBooking();
  const { mutateAsync: createTeamBooking, isPending: createTeamBookingPending } = useCreateTeamBooking();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      return data.display_name;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleSetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      const address = await reverseGeocode(lat, lng);
      setPickup({ address, lat, lng });
    });
  };

  const handleMapClick = async (latlng) => {
    if (!selectingMapFor) return;
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    if (selectingMapFor === "pickup") setPickup({ address, lat: latlng.lat, lng: latlng.lng });
    else setDropoff({ address, lat: latlng.lat, lng: latlng.lng });
    setSelectingMapFor(null);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!pickup.lat || !pickup.lng) return "Please select a pickup location.";
    if (!dropoff.lat || !dropoff.lng) return "Please select a drop-off location.";

    if (porterType === "individual") {
      if (!hasVehicle && !purpose) return "Please select a purpose of booking.";
      if (!hasVehicle && (!weight || Number(weight) < 5)) return "Weight must be at least 5 kg.";
      if (hasVehicle && !vehicleType) return "Please select a vehicle type.";
    }

    if (porterType === "team") {
      if (!teamSize || Number(teamSize) < 1) return "Number of porters must be at least 1.";
      if (!hasVehicle && (!weight || Number(weight) < 5)) return "Weight must be at least 5 kg.";
      if (!hasVehicle && !purpose) return "Please select a purpose of booking.";
      if (hasVehicle && !vehicleType) return "Please select a vehicle type.";
      if (hasVehicle && numberOfVehicles && Number(numberOfVehicles) < 1)
        return "Number of vehicles must be at least 1.";
      if (bookingDate) {
        const selected = new Date(bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) return "Booking date must be today or a future date.";
      }
      if (bookingDate && !bookingTime) return "Please provide a booking time when a date is selected.";
    }

    return null;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const error = validateForm();
    if (error) { setFormError(error); return; }
    setFormError("");

    if (porterType === "team") {
      try {
        const res = await createTeamBooking({
          pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address || "" },
          drop: { lat: dropoff.lat, lng: dropoff.lng, address: dropoff.address || "" },
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
          hasLift,
          no_of_trips: numberOfTrips ? Number(numberOfTrips) : null,
        });
        navigate("/dashboard/booking/team-tracking", {
          state: { bookingId: res?.bookingId || res?.data?.bookingId },
        });
      } catch (err) {
        console.error("Team booking error:", err);
      }
      return;
    }

    try {
      const res = await searchNearByPorter({
        bookingType: porterType,
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address || "" },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng, address: dropoff.address || "" },
        weightKg: weight,
        hasVehicle,
        vehicleType: hasVehicle ? vehicleType : null,
        purpose,
        no_of_floors: numberOfFloors,
        has_lift: hasLift,
        trip: numberOfTrips,
      });
      setPorters(traverseInPorter(res?.data?.data));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookPorter = (porter) => {
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
        numberOfVehicles: porterType === "team" && hasVehicle ? numberOfVehicles : null,
        purpose,
        numberOfFloors,
        has_lift: hasLift,
        hasVehicle,
        trip: numberOfTrips,
        totalPrice,
      },
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-1">
        {/* Map */}
        <BookingMap
          selectingMapFor={selectingMapFor}
          onMapClick={handleMapClick}
          pickup={pickup}
          dropoff={dropoff}
          onCancelSelect={() => setSelectingMapFor(null)}
        />

        {/* Form + Porter List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-3">
          {/* Left: Form */}
          <div className="lg:col-span-8">
            <Card className="rounded-4">
              <CardHeader className="pb-3">
                <BookingTypeToggle porterType={porterType} onChange={setPorterType} />
              </CardHeader>
              <CardContent className="space-y-4">
                <LocationInputs
                  pickup={pickup}
                  dropoff={dropoff}
                  selectingMapFor={selectingMapFor}
                  onPickupChange={setPickup}
                  onDropoffChange={setDropoff}
                  onSelectMapFor={setSelectingMapFor}
                  onSetCurrentLocation={handleSetCurrentLocation}
                />

                <VehicleSelector
                  hasVehicle={hasVehicle}
                  onToggle={() => setHasVehicle(!hasVehicle)}
                  vehicleType={vehicleType}
                  onVehicleTypeChange={handleVehicleTypeChange}
                  porterType={porterType}
                  numberOfVehicles={numberOfVehicles}
                  onNumberOfVehiclesChange={setNumberOfVehicles}
                />

                {/* Individual-only purpose fields */}
                {porterType === "individual" && !hasVehicle && (
                  <PurposeFields
                    purpose={purpose}
                    onPurposeChange={setPurpose}
                    weight={weight}
                    onWeightChange={setWeight}
                    numberOfTrips={numberOfTrips}
                    onNumberOfTripsChange={setNumberOfTrips}
                    numberOfFloors={numberOfFloors}
                    onNumberOfFloorsChange={setNumberOfFloors}
                    hasLift={hasLift}
                    onHasLiftToggle={() => setHasLift(!hasLift)}
                  />
                )}

                {/* Team-only fields */}
                {porterType === "team" && (
                  <TeamFields
                    teamSize={teamSize} onTeamSizeChange={setTeamSize}
                    weight={weight} onWeightChange={setWeight}
                    purpose={purpose} onPurposeChange={setPurpose}
                    numberOfFloors={numberOfFloors} onNumberOfFloorsChange={setNumberOfFloors}
                    hasLift={hasLift} onHasLiftToggle={() => setHasLift(!hasLift)}
                    numberOfTrips={numberOfTrips} onNumberOfTripsChange={setNumberOfTrips}
                    requirements={requirements} onRequirementsChange={setRequirements}
                    bookingDate={bookingDate} onBookingDateChange={setBookingDate}
                    bookingTime={bookingTime} onBookingTimeChange={setBookingTime}
                  />
                )}

                {/* Fare breakdown (individual only, after search) */}
                {hasSearched && (
                  <FareEstimateBreakdown
                    numberOfFloors={numberOfFloors}
                    hasLift={hasLift}
                    numberOfTrips={numberOfTrips}
                    hasVehicle={hasVehicle}
                    vehicleType={vehicleType}
                    weight={weight}
                    distanceKm={distanceKm}
                    showFareBreakdown={showFareBreakdown}
                    setShowFareBreakdown={setShowFareBreakdown}
                    setTotalPrice={setTotalPrice}
                  />
                )}

                {/* Validation error */}
                {formError && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v4a1 1 0 01-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2 flex justify-center">
                  <Button
                    className="w-full md:w-auto px-12 h-10 font-medium text-base shadow-sm hover:shadow active:scale-[0.98] transition-all bg-[#D35400] hover:bg-[#A04000] text-white"
                    onClick={handleSearch}
                    disabled={porterType === "team" ? createTeamBookingPending : searchNearByPorterPending}
                  >
                    {porterType === "team" && createTeamBookingPending && (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    {porterType === "team" ? "Book Team Porter" : "Find Porters"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Porter list */}
          <div className="lg:col-span-4">
            <PorterList
              porters={porters}
              hasSearched={hasSearched}
              isLoading={searchNearByPorterPending}
              onBook={handleBookPorter}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PorterBooking;
