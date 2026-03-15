import React, { useEffect, useState, useCallback } from "react";
import {
  getAllPorters,
} from "@/apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  RefreshCw,
  Truck,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PorterManagement = () => {
  const [porters, setPorters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Detail Sheet
  const [detailPorter, setDetailPorter] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPorters = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPorters({
          searchText: debouncedSearch || undefined,
          page: currentPage,
          limit: 10,
        });
        if (response.data.success) {
          setPorters(response.data.data || []);
          setPagination(
            response.data.pagination || { total: 0, pages: 1 }
          );
        }
      } catch (err) {
        console.error("Failed to fetch porters:", err);
        setError("Failed to load porters. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    fetchPorters(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPorters(newPage);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Porter Management
          </h1>
          <p className="text-gray-500 mt-1">
            View and monitor all registered active porters.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPorters(page)}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search porters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {pagination.total > 0 && (
          <span className="text-sm text-gray-500">
            {pagination.total} porter{pagination.total !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Porter</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Current Job</TableHead>
              <TableHead className="font-semibold">Verified</TableHead>
              <TableHead className="text-right font-semibold pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : porters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No porters found.</p>
                  {debouncedSearch && (
                    <p className="text-gray-400 text-sm mt-1">
                      Try a different search term.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              porters.map((porter) => (
                <TableRow key={porter._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {porter.userId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {porter.userId?.phone || porter.userId?.email || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {porter.porterType || "—"}
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {porter.role || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`capitalize ${
                        porter.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {porter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`capitalize ${
                        porter.currentStatus === "busy"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {porter.currentStatus || "available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {porter.isVerified ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setDetailPorter(porter);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.pages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Porter Details</SheetTitle>
            <SheetDescription>
              Full profile for {detailPorter?.userId?.name}
            </SheetDescription>
          </SheetHeader>
          {detailPorter && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {detailPorter.userId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm mt-1">
                    {detailPorter.userId?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Porter Type
                  </p>
                  <p className="text-sm mt-1 capitalize">
                    {detailPorter.porterType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Role
                  </p>
                  <p className="text-sm mt-1 capitalize">
                    {detailPorter.role || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Status
                  </p>
                  <Badge
                    className={`mt-1 capitalize ${
                      detailPorter.status === "active"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {detailPorter.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Current Job
                  </p>
                  <Badge className="mt-1 capitalize bg-blue-100 text-blue-800 border-blue-200">
                    {detailPorter.currentStatus || "available"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Verified
                  </p>
                  <p className="text-sm mt-1">
                    {detailPorter.isVerified ? (
                      <span className="text-blue-600 font-medium">✓ Verified</span>
                    ) : (
                      <span className="text-gray-500">Not verified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PorterManagement;
