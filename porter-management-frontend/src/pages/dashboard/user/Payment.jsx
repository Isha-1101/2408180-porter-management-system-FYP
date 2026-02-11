import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CreditCard,
    Banknote,
    ArrowLeft,
    CheckCircle2,
    Wallet,
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

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalPrice, bookingDetails } = location.state || {};

    const [selectedMethod, setSelectedMethod] = useState("");

    // If no booking data, redirect back
    if (!totalPrice || !bookingDetails) {
        navigate("/dashboard/booking");
        return null;
    }

    const paymentMethods = [
        {
            id: "cash",
            name: "Cash on Delivery",
            description: "Pay when the porter arrives",
            icon: Banknote,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
        },
        {
            id: "khalti",
            name: "Khalti",
            description: "Pay using Khalti e-wallet",
            icon: Wallet,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            isKhalti: true,
        },
    ];

    const handleConfirmPayment = () => {
        if (!selectedMethod) {
            alert("Please select a payment method");
            return;
        }

        if (selectedMethod === "khalti") {
            // In production, integrate actual Khalti SDK here
            alert("Khalti payment integration would happen here");
            // For now, mock success
            navigate("/dashboard/orders");
        } else {
            // Cash on delivery - navigate to success page
            navigate("/dashboard/booking/success", {
                state: {
                    totalPrice,
                    bookingDetails,
                    paymentMethod: "cash",
                },
            });
        }
    };

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Booking Summary
                </Button>

                <Card className="border-t-4 border-t-primary shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-bold">
                            Select Payment Method
                        </CardTitle>
                        <CardDescription>
                            Choose how you'd like to pay for your booking
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Total Amount Display */}
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-muted-foreground">
                                    Total Amount
                                </span>
                                <span className="text-3xl font-bold text-primary">
                                    NPR {totalPrice}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Methods */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Payment Options</h3>

                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`w-full text-left transition-all ${selectedMethod === method.id
                                        ? "scale-[1.02]"
                                        : "hover:shadow-md"
                                        }`}
                                >
                                    <Card
                                        className={`${selectedMethod === method.id
                                            ? "border-primary border-2 bg-primary/5"
                                            : ""
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                {/* Icon or Khalti Logo */}
                                                <div
                                                    className={`w-16 h-16 rounded-lg flex items-center justify-center ${method.bgColor} ${method.borderColor} border-2`}
                                                >
                                                    {method.isKhalti ? (
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            K
                                                        </div>
                                                    ) : (
                                                        <method.icon
                                                            className={`w-8 h-8 ${method.color}`}
                                                        />
                                                    )}
                                                </div>

                                                {/* Method Info */}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">
                                                        {method.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {method.description}
                                                    </p>
                                                </div>

                                                {/* Selection Indicator */}
                                                {selectedMethod === method.id && (
                                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>

                        {/* Confirm Button */}
                        <div className="pt-4">
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleConfirmPayment}
                                disabled={!selectedMethod}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {selectedMethod === "khalti"
                                    ? "Proceed to Khalti Payment"
                                    : selectedMethod === "cash"
                                        ? "Confirm Booking"
                                        : "Select Payment Method"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default Payment;
