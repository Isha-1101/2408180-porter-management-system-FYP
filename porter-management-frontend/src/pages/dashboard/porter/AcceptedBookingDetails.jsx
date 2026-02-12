import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    MapPin,
    Navigation,
    User,
    Phone,
    MessageSquare,
    Clock,
    Package,
    Truck,
    ArrowLeft,
    DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import UserMap from "@/components/Map/UserMap"; // Adjust path if necessary

const AcceptedBookingDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Dummy data for visualization when no state is passed
    const dummyBooking = {
        id: "DEMO-123",
        userName: "Demo User",
        pickup: {
            lat: 27.7172,
            lng: 85.324,
            address: "Demo Pickup Location, Kathmandu"
        },
        drop: {
            lat: 27.69,
            lng: 85.342,
            address: "Demo Drop Location, Lalitpur"
        },
        weight: 15,
        vehicleType: "BIKE",
        distance: 3.5,
        fare: 450
    };

    const booking = location.state?.booking || dummyBooking;

    return (
        <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">Booking Details</h1>
                <Badge variant="outline" className="ml-auto">
                    #{booking.id}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column - Map */}
                <div className="lg:col-span-2 h-full min-h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                    {/* Note: UserMap typically handles user location. For a specific trip, 
               ideally we'd pass pickup/drop coordinates to it or use a simpler MapContainer. 
               Reusing UserMap for now as requested/implied context. 
               If UserMap supports props for markers, we'd pass them. 
               Assuming UserMap is the main map component. */}
                    <UserMap showSidebar={false} className="h-full w-full" />
                    {/* Overlays for Pickup/Drop context if UserMap doesn't take props for them yet. 
               In a real implementation, we'd refactor UserMap to accept 'route' props. 
               For now, focusing on layout. */}
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
                    {/* Customer Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Customer Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {booking.userName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{booking.userName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                                        <span>★</span>
                                        <span>4.8</span>
                                    </div>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <Button size="icon" variant="outline" className="rounded-full">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="rounded-full">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Journey Details */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Navigation className="h-5 w-5 text-primary" />
                                Journey
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Location Timeline */}
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full border-2 border-green-500 bg-white" />
                                    <p className="text-xs text-gray-500">Pickup</p>
                                    <p className="font-medium text-sm">{booking.pickup.address}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full border-2 border-blue-500 bg-white" />
                                    <p className="text-xs text-gray-500">Drop-off</p>
                                    <p className="font-medium text-sm">{booking.drop.address}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Distance</p>
                                    <p className="font-semibold">{booking.distance} km</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Est. Time</p>
                                    {/* Mock time calculation */}
                                    <p className="font-semibold">{Math.round(booking.distance * 10)} min</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Details */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Shipment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Vehicle</span>
                                </div>
                                <span className="text-sm font-bold">{booking.vehicleType}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Weight</span>
                                </div>
                                <span className="text-sm font-bold">{booking.weight} kg</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">Total Fare</span>
                                </div>
                                <span className="text-lg font-bold text-green-700">Rs. {booking.fare}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-auto pt-4 pb-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold shadow-md">
                            Start Journey
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptedBookingDetails;
