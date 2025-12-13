import { useMemo, useState } from "react";
import { MapPin, Filter, Star, Clock, Truck, Users } from "lucide-react";
import UserMap from "../../components/Map/UserMap";
import PorterDashboard from "./PorterDashboard";

const PorterBooking = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicle, setVehicle] = useState("bike");
  const [service, setService] = useState("standard");
  const [maxPrice, setMaxPrice] = useState(500);

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
        vehicle: "scooter",
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
        vehicle: "pickup",
        tags: ["Heavy Load"],
      },
    ],
    []
  );

  const filteredPorters = useMemo(() => {
    return porters
      .filter((p) => (vehicle ? p.vehicle === vehicle : true))
      .filter((p) => p.price <= maxPrice);
  }, [porters, vehicle, maxPrice]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Porter Booking
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Book a porter, choose service options, and assign instantly.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{filteredPorters.length} available now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <MapPin className="w-5 h-5 text-primary" />
                Live Map
              </div>
              <div className="text-xs text-gray-500">Live porter locations</div>
            </div>
            <div className="h-[320px] md:h-[420px]">
              <UserMap className="h-full w-full" showSidebar={false} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-gray-900">Booking Options</h2>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pickup location
                </label>
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. New Road, Kathmandu"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Dropoff location
                </label>
                <input
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="e.g. Kalanki"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="fragile">Fragile</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Max price (NPR): {maxPrice}
                </label>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 w-full"
                />
                <div className="mt-2 text-xs text-gray-500">
                  This is mock filtering — hook into pricing engine later.
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>
                    Vehicle: <span className="font-medium">{vehicle}</span>,
                    Service: <span className="font-medium">{service}</span>
                  </span>
                </div>
                <button className="rounded-xl bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary/90 transition cursor-pointer">
                  Find Best Porter
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Available Porters</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a porter to book (mock data).
            </p>
          </div>

          <div className="p-4 space-y-3">
            {filteredPorters.map((porter) => (
              <div
                key={porter.id}
                className="rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {porter.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {porter.rating}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {porter.etaMin} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Estimated</div>
                    <div className="text-lg font-bold text-gray-900">
                      NPR {porter.price}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {porter.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-700">
                    {porter.completed} trips
                  </span>
                </div>

                <button className="mt-4 w-full rounded-xl bg-gray-900 text-white px-4 py-2.5 font-semibold hover:bg-gray-800 transition cursor-pointer">
                  Book {porter.name}
                </button>
              </div>
            ))}

            {filteredPorters.length === 0 && (
              <div className="text-sm text-gray-600 p-6 text-center">
                No porters match your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      <PorterDashboard />
    </div>
  );
};

export default PorterBooking;
