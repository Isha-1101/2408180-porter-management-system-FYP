import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CheckCircle,
    MapPin,
    User,
    Package,
    Clock,
    CreditCard,
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

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails, totalPrice, paymentMethod } = location.state || {};

    useEffect(() => {
        if (!bookingDetails) {
            navigate("/dashboard/booking");
        }
    }, [bookingDetails, navigate]);

    if (!bookingDetails) return null;

    const { porter, pickup, dropoff, weight } = bookingDetails;

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Success Header */}
                <Card className="border-t-4 border-t-green-500 shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">
                            Booking Confirmed!
                        </CardTitle>
                        <CardDescription className="text-base">
                            Your porter request has been successfully placed
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Order Details */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Booking Details
                            </h3>

                            {/* Porter Info */}
                            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{porter?.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {porter?.type} Porter • {porter?.rating} ★
                                    </p>
                                </div>
                            </div>

                            {/* Route */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                        <div className="w-0.5 h-8 bg-gray-200 mx-auto my-1" />
                                        <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">
                                                PICKUP
                                            </p>
                                            <p className="font-medium">{pickup || "Current Location"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">
                                                DROPOFF
                                            </p>
                                            <p className="font-medium">{dropoff}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-900">
                                    Total Weight
                                </span>
                                <span className="font-bold text-blue-900">{weight} kg</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Payment Information
                            </h3>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div>
                                    <p className="font-semibold text-green-900">
                                        {paymentMethod === "cash"
                                            ? "Cash on Delivery"
                                            : "Khalti Payment"}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {paymentMethod === "cash"
                                            ? "Pay when porter arrives"
                                            : "Paid via Khalti"}
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-green-900">
                                    NPR {totalPrice}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Next Steps */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                What's Next?
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>You'll receive a notification once a porter accepts your request</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Track your porter's location in real-time</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>
                                        {paymentMethod === "cash"
                                            ? "Prepare cash payment for when the porter arrives"
                                            : "Your payment has been processed"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate("/dashboard")}
                            >
                                Back to Home
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => navigate("/dashboard/orders")}
                            >
                                View My Orders
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default OrderConfirmation;
