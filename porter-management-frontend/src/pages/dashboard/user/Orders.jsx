import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserBookingsService } from "@/apis/services/porterBookingsService";
import { useSubmitRating, useGetBookingRating } from "@/apis/hooks/ratingHooks";
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
  Navigation,
  Users,
  Eye,
} from "lucide-react";
import PageLayout from "../../../components/common/PageLayout";

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
    icon: <CheckCircle className="w-3 h-3" />,
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
  // Team booking statuses
  PENDING_TEAM_REVIEW: {
    label: "Finding Team",
    cls: "bg-violet-100 text-violet-800 border-violet-200",
    icon: <Clock className="w-3 h-3" />,
  },
  PENDING_MEMBER_RESPONSE: {
    label: "Team Responding",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <Users className="w-3 h-3" />,
  },
  AWAITING_OWNER_CONFIRMATION: {
    label: "Awaiting Owner",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="w-3 h-3" />,
  },
  DECLINED: {
    label: "Declined",
    cls: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  CLOSED: {
    label: "Closed",
    cls: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

const getStatusConfig = (s) =>
  STATUS_CONFIG[s] || {
    label: s,
    cls: "bg-gray-100 text-gray-700",
    icon: null,
  };

// ────────────────────────────────────
// Trackable status sets
// ────────────────────────────────────
// Team booking statuses the user can track live
const TRACKABLE_TEAM_STATUSES = [
  "PENDING_TEAM_REVIEW",
  "PENDING_MEMBER_RESPONSE",
  "AWAITING_OWNER_CONFIRMATION",
  "CONFIRMED",
  "IN_PROGRESS",
];

// Individual booking statuses the user can track live
const TRACKABLE_INDIVIDUAL_STATUSES = [
  "WAITING_PORTER",
  "CONFIRMED",
  "IN_PROGRESS",
];

// ────────────────────────────────────
// Booking Card
// ────────────────────────────────────
const BookingCard = ({ booking, onRate, onTrack }) => {
  const sc = getStatusConfig(booking.status);
  const isCompleted = booking.status === "COMPLETED";
  const isTeam = booking.bookingType === "team";

  const canTrackTeam = isTeam && TRACKABLE_TEAM_STATUSES.includes(booking.status);
  const canTrackIndividual =
    !isTeam && TRACKABLE_INDIVIDUAL_STATUSES.includes(booking.status);
  const canTrack = canTrackTeam || canTrackIndividual;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left / Icon */}
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            {isTeam ? (
              <Users className="w-5 h-5 text-primary" />
            ) : (
              <Package className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`flex items-center gap-1 text-xs ${sc.cls}`}>
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
              {isTeam && booking.teamSize && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {booking.teamSize} porters
                </span>
              )}
              {booking.bookingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              )}
              {booking.totalPrice > 0 && (
                <span className="font-semibold text-gray-800">
                  ₹{booking.totalPrice}
                </span>
              )}
              {booking.completedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Completed {new Date(booking.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Right / Actions */}
          <div className="shrink-0 self-center sm:self-start flex flex-col gap-2">
            {/* Track button for active bookings */}
            {canTrack && (
              <Button
                size="sm"
                className="flex items-center gap-1.5 min-w-[90px]"
                onClick={() => onTrack(booking)}
              >
                <Navigation className="w-3.5 h-3.5" />
                Track
              </Button>
            )}

            {/* View details for completed team bookings */}
            {isCompleted && isTeam && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 min-w-[90px]"
                onClick={() => onTrack(booking)}
              >
                <Eye className="w-3.5 h-3.5" />
                Details
              </Button>
            )}

            {/* Rate button for completed individual bookings */}
            {isCompleted && booking.assignedPorterId && (
              <RateButton
                bookingId={booking._id}
                porterId={
                  booking.assignedPorterId?._id || booking.assignedPorterId
                }
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
  const { data: ratingData, isLoading } = useGetBookingRating(bookingId);
  const existingRating = ratingData?.data?.data?.review;

  if (isLoading) return null;

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
      className="flex items-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 min-w-[90px]"
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
  const [error, setError] = useState(null);

  const { mutateAsync: submitRatingMutation, isPending: loading } = useSubmitRating({
    onSuccess: () => {
      onSubmitSuccess();
      onClose();
      setRating(0);
      setComment("");
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Failed to submit rating. Try again.",
      );
    },
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    await submitRatingMutation({
      bookingId: target.bookingId,
      porterId: target.porterId,
      rating,
      comment,
    });
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
            Rate Later
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
// Tab definitions
// ────────────────────────────────────
const TABS = [
  { value: "", label: "All Orders" },
  { value: "active", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Active statuses (multi-value filtering done client-side)
const ACTIVE_STATUSES = [
  "CONFIRMED",
  "IN_PROGRESS",
  "WAITING_PORTER",
  "SEARCHING",
  // Team booking active statuses
  "PENDING_TEAM_REVIEW",
  "PENDING_MEMBER_RESPONSE",
  "AWAITING_OWNER_CONFIRMATION",
];

// ────────────────────────────────────
// Main Orders Page
// ────────────────────────────────────
const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Rating modal state
  const [ratingTarget, setRatingTarget] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Intercept completion redirect to auto-prompt rating
  useEffect(() => {
    if (location.state?.promptRatingFor) {
      setRatingTarget(location.state.promptRatingFor);
      setIsRatingOpen(true);
      // Clean up state so refresh doesn't trigger it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchBookings = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        // Build query params — active tab uses client-side filter
        const params = { page: currentPage, limit: 10 };
        if (activeTab && activeTab !== "active") {
          params.status = activeTab;
        }

        const response = await getUserBookingsService(params);
        if (response.data.success) {
          let data = response.data.data.bookings || [];

          // Client-side filter for "active" tab (multiple statuses)
          if (activeTab === "active") {
            data = data.filter((b) => ACTIVE_STATUSES.includes(b.status));
          }

          setBookings(data);
          setPagination(
            response.data.data.pagination || { total: 0, pages: 1 },
          );
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    setPage(1);
    fetchBookings(1);
  }, [activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRate = ({ bookingId, porterId }) => {
    setRatingTarget({ bookingId, porterId });
    setIsRatingOpen(true);
  };

  /**
   * Navigate to the correct tracking page based on booking type.
   * Uses URL-param based routes so no router-state dependency.
   */
  const handleTrack = (booking) => {
    const id = booking._id;
    if (booking.bookingType === "team") {
      navigate(`/dashboard/booking/team-tracking/${id}`);
    } else {
      navigate(`/dashboard/booking/tracking/${id}`);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      className="p-6 md:p-8 space-y-6 min-w-full mx-auto"
      title="My Orders"
      description="View your booking history and track active bookings."
      headerExtraChildren={
        <Button
          size="sm"
          onClick={() => fetchBookings(page)}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
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
                  : activeTab === "active"
                    ? "No active bookings at the moment."
                    : "Your orders will appear here once you book a porter."}
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onRate={handleRate}
                onTrack={handleTrack}
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
    </PageLayout>
  );
};

export default Orders;
