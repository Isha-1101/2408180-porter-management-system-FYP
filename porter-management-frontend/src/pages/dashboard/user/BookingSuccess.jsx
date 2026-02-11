import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CheckCircle,
    MapPin,
    Navigation,
    User,
    Banknote,
    Calendar,
    Home,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PageLayout from "@/components/common/PageLayout";

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalPrice, bookingDetails, paymentMethod } = location.state || {};

    useEffect(() => {
        if (!totalPrice || !bookingDetails || !paymentMethod) {
            navigate("/dashboard/booking");
        }
    }, [totalPrice, bookingDetails, paymentMethod, navigate]);

    if (!totalPrice || !bookingDetails || !paymentMethod) return null;

    const { porter, pickup, dropoff, weight } = bookingDetails;

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto space-y-6 py-8">
                {/* Success Icon and Message */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Porter Booked Successfully! 🎉
                        </h1>
                        <p className="text-gray-600">
                            Your booking has been confirmed. The porter will arrive at your location soon.
                        </p>
                    </div>
                </div>

                {/* Booking Details Card */}
                <Card className="border-t-4 border-t-green-500 shadow-lg">
                    <CardHeader className="text-center pb-4 bg-green-50/50">
                        <CardTitle className="text-xl font-bold text-gray-900">
                            Booking Confirmation
                        </CardTitle>
                        <CardDescription>
                            Reference ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {/* Porter Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Porter Details
                            </h3>
                            <div className="flex items-center gap-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{porter.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium capitalize">
                                            {porter.type} Porter
                                        </span>
                                        <span>•</span>
                                        <span>{porter.rating} ★</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Route Details */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Route Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                        <div className="w-0.5 h-10 bg-gray-200 mx-auto my-1" />
                                        <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                                Pickup Location
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {pickup || "Current Location"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                                Dropoff Location
                                            </p>
                                            <p className="font-medium text-gray-900">{dropoff}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Banknote className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Cash on Delivery</p>
                                            <p className="text-xs text-gray-600">Pay when porter arrives</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">NPR {totalPrice}</p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                                        <span className="text-lg">💡</span>
                                        <span>
                                            Please keep the exact amount ready. The porter will collect payment upon arrival.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                What's Next?
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>You will receive a notification when the porter is on the way</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Track your porter in real-time from the Orders page</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Prepare the items to be delivered</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        size="lg"
                        onClick={() => navigate("/dashboard")}
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        size="lg"
                        onClick={() => navigate("/dashboard/orders")}
                    >
                        <FileText className="w-5 h-5" />
                        View My Orders
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default BookingSuccess;
