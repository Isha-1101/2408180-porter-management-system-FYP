import React, { useState, useEffect, useCallback } from "react";
import { getUserBookingsService } from "@/apis/services/porterBookingsService";
import {
  submitRating,
  getBookingRating,
} from "@/apis/services/ratingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Package,
  Calendar,
  Star,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ────────────────────────────────────
// Star Rating Component
// ────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false, size = "md" }) => {
  const [hovered, setHovered] = useState(0);
  const starSize = size === "sm" ? "w-4 h-4" : "w-7 h-7";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 fill-transparent"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ────────────────────────────────────
// Status config
// ────────────────────────────────────
const STATUS_CONFIG = {
  COMPLETED: {
    label: "Completed",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  CONFIRMED: {
    label: "Confirmed",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="w-3 h-3" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    cls: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <RefreshCw className="w-3 h-3" />,
  },
  WAITING_PORTER: {
    label: "Searching",
    cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  SEARCHING: {
    label: "Searching",
    cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
};

const getStatusConfig = (s) =>
  STATUS_CONFIG[s] || {
    label: s,
    cls: "bg-gray-100 text-gray-700",
    icon: null,
  };

// ────────────────────────────────────
// Booking Card
// ────────────────────────────────────
const BookingCard = ({ booking, onRate }) => {
  const sc = getStatusConfig(booking.status);
  const isCompleted = booking.status === "COMPLETED";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left / Icon */}
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                className={`flex items-center gap-1 text-xs ${sc.cls}`}
              >
                {sc.icon}
                {sc.label}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {booking.bookingType}
              </Badge>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(booking.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Locations */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 line-clamp-1">
                  {booking.pickup?.address || "Pickup location"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-gray-700 line-clamp-1">
                  {booking.drop?.address || "Drop location"}
                </span>
              </div>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {booking.weightKg} kg
              </span>
              {booking.totalPrice > 0 && (
                <span className="font-semibold text-gray-800">
                  ₹{booking.totalPrice}
                </span>
              )}
              {booking.completedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Completed{" "}
                  {new Date(booking.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Right / Actions */}
          <div className="shrink-0 self-center sm:self-start">
            {isCompleted && booking.assignedPorterId && (
              <RateButton
                bookingId={booking._id}
                porterId={booking.assignedPorterId?._id || booking.assignedPorterId}
                onRate={onRate}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────
// Rate Button (fetches existing rating)
// ────────────────────────────────────
const RateButton = ({ bookingId, porterId, onRate }) => {
  const [existingRating, setExistingRating] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getBookingRating(bookingId)
      .then((res) => {
        if (res.data.success) {
          setExistingRating(res.data.data.review);
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [bookingId]);

  if (!checked) return null;

  if (existingRating) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">Your rating</span>
        <StarRating value={existingRating.rating} readonly size="sm" />
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="flex items-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
      onClick={() => onRate({ bookingId, porterId })}
    >
      <Star className="w-3.5 h-3.5" />
      Rate Porter
    </Button>
  );
};

// ────────────────────────────────────
// Rating Modal
// ────────────────────────────────────
const RatingModal = ({ open, onClose, target, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await submitRating({
        bookingId: target.bookingId,
        porterId: target.porterId,
        rating,
        comment,
      });
      onSubmitSuccess();
      onClose();
      setRating(0);
      setComment("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit rating. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Porter</DialogTitle>
          <DialogDescription>
            Share your experience to help other users.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-3">
            <StarRating value={rating} onChange={setRating} />
            <span className="text-sm text-gray-500">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent!"}
            </span>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Leave a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Star className="w-4 h-4 mr-2" />
            )}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────
// Main Orders Page
// ────────────────────────────────────
const TABS = [
  { value: "", label: "All Orders" },
  { value: "CONFIRMED,IN_PROGRESS,WAITING_PORTER,SEARCHING", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const Orders = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Rating modal state
  const [ratingTarget, setRatingTarget] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const fetchBookings = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: currentPage, limit: 8 };
        // Send individual status values (backend accepts single status param)
        if (activeTab) {
          // If multiple statuses, use first one (or send without for all)
          params.status = activeTab.includes(",") ? undefined : activeTab;
        }
        const response = await getUserBookingsService(params);
        if (response.data.success) {
          let data = response.data.data.bookings || [];
          // Client-side filter if multiple statuses (active tab)
          if (activeTab && activeTab.includes(",")) {
            const statuses = activeTab.split(",");
            data = data.filter((b) => statuses.includes(b.status));
          }
          setBookings(data);
          setPagination(
            response.data.data.pagination || { total: 0, pages: 1 }
          );
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    setPage(1);
    fetchBookings(1);
  }, [activeTab]);

  const handleRate = ({ bookingId, porterId }) => {
    setRatingTarget({ bookingId, porterId });
    setIsRatingOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-500 mt-1">
            View your booking history and rate your porters.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchBookings(page)}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2 flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        <div className="space-y-4 mt-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-xl animate-pulse"
              />
            ))
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <ClipboardList className="w-14 h-14 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No orders found
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "COMPLETED"
                  ? "You don't have any completed orders yet."
                  : "Your orders will appear here once you book a porter."}
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onRate={handleRate}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && !loading && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = page - 1;
                  setPage(p);
                  fetchBookings(p);
                }}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = page + 1;
                  setPage(p);
                  fetchBookings(p);
                }}
                disabled={page >= pagination.pages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Rating Modal */}
      <RatingModal
        open={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        target={ratingTarget}
        onSubmitSuccess={() => fetchBookings(page)}
      />
    </div>
  );
};

export default Orders;
