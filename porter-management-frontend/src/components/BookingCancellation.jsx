import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Booking Cancellation Component
 * Allows user/porter to cancel bookings with reason
 */
export const BookingCancellation = ({
  bookingId,
  userRole,
  currentStatus,
  onCancelSuccess,
}) => {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelStats, setCancelStats] = useState(null);

  const canBeCancelled = ![
    "COMPLETED",
    "CANCELLED",
  ].includes(currentStatus);

  const fetchCancelStats = async () => {
    try {
      const response = await axios.get(
        `/core-api/bookings/cancellations/remaining`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCancelStats(response.data.data);
    } catch (error) {
      console.error("Error fetching cancel stats:", error);
    }
  };

  const handleShowCancelForm = () => {
    fetchCancelStats();
    setShowCancelForm(true);
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters");
      return;
    }

    setCancelling(true);
    try {
      const response = await axios.post(
        `/core-api/bookings/${bookingId}/cancel`,
        { reason: reason.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Booking cancelled successfully");
      setShowCancelForm(false);
      setReason("");

      if (onCancelSuccess) {
        onCancelSuccess(response.data.data);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to cancel booking";
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  if (!canBeCancelled) {
    return null;
  }

  return (
    <>
      {!showCancelForm && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleShowCancelForm}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Cancel Booking
        </Button>
      )}

      {showCancelForm && (
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Cancel Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cancellation Stats */}
            {cancelStats && (
              <Alert className="bg-white border-red-200">
                <AlertDescription className="text-sm">
                  You have{" "}
                  <span className="font-bold text-red-600">
                    {cancelStats.remaining}
                  </span>{" "}
                  cancellations remaining today (
                  {cancelStats.usedToday}/{cancelStats.limit})
                </AlertDescription>
              </Alert>
            )}

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Cancellation
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you want to cancel this booking..."
                className="min-h-24"
                disabled={cancelling}
              />
              <p className="text-xs text-gray-500">
                Minimum 5 characters required
              </p>
            </div>

            {/* Warning */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-700">
                Cancelling this booking cannot be undone. Make sure this is what
                you want.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCancelForm(false);
                  setReason("");
                }}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={cancelling || !reason.trim()}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Confirm Cancel
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default BookingCancellation;
