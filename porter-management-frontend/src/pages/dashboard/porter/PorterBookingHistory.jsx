import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "../../../components/common/PageLayout";
import { useGetPorterBookings } from "../../../apis/hooks/porterBookingsHooks";

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
    icon: <Navigation className="w-3 h-3" />,
  },
  WAITING_PORTER: {
    label: "Waiting",
    cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
};

const PorterBookingHistory = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPorterBookings();

  // Filter bookings based on status and current page
  const allBookings = data?.bookings || [];
  let filteredBookings = allBookings;
  
  if (statusFilter !== "all") {
    filteredBookings = allBookings.filter(b => b.status === statusFilter);
  }
  
  // Implement client-side pagination
  const limit = 10;
  const totalPages = Math.ceil(filteredBookings.length / limit);
  const startIdx = (page - 1) * limit;
  const bookings = filteredBookings.slice(startIdx, startIdx + limit);
  
  const pagination = {
    total: filteredBookings.length,
    page,
    limit,
    totalPages,
  };

  const handleViewBooking = (booking) => {
    navigate("/dashboard/porters/accepted-booking", {
      state: { booking },
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Booking History" description="Your past and current bookings">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-gray-500">Loading booking history...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Booking History" description="Your past and current bookings">
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Booking List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No bookings found</p>
              <p className="text-xs text-gray-500">
                {statusFilter === "all"
                  ? "Your booking history will appear here."
                  : `No ${statusFilter.toLowerCase()} bookings yet.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const sc = STATUS_CONFIG[booking.status] || {
                label: booking.status,
                cls: "bg-gray-100 text-gray-700",
                icon: null,
              };
              const customerName =
                typeof booking.userId === "object"
                  ? booking.userId?.name || "Customer"
                  : "Customer";

              return (
                <Card key={booking._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`flex items-center gap-1 text-xs ${sc.cls}`}>
                            {sc.icon}
                            {sc.label}
                          </Badge>
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(booking.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Customer */}
                        <p className="text-sm font-medium text-gray-900 mb-2">{customerName}</p>

                        {/* Locations */}
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <span className="truncate">
                              {booking.pickup?.address || "Pickup location"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span className="truncate">
                              {booking.drop?.address || "Drop location"}
                            </span>
                          </div>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {booking.weightKg} kg
                          </span>
                          {booking.vehicleType && (
                            <span className="capitalize">{booking.vehicleType}</span>
                          )}
                          <span className="font-semibold text-primary">
                            NPR {booking.totalPrice || 0}
                          </span>
                          {booking.paymentMethod && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {booking.paymentMethod}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* View button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PorterBookingHistory;
