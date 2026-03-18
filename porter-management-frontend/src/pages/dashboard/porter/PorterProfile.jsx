import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Car,
  Package,
  Bike,
  Image as ImageIcon,
  Pencil,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageLayout from "@/components/common/PageLayout";
import { useGetPorterByUser } from "@/apis/hooks/portersHooks";
import { useAuthStore } from "@/store/auth.store";
import { getCloudinaryUrl } from "@/utils/helper";
import { porterRetgistrationHooks } from "@/apis/hooks/porterRegistratioHooks";
import { useState } from "react";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  const config = {
    active: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: "Active",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    rejected: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: "Rejected",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };
  const s = config[status?.toLowerCase()] || config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.className}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="p-2 bg-primary/8 rounded-lg text-primary mt-0.5 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 font-medium mt-0.5 wrap-break-word">
        {value || "—"}
      </p>
    </div>
  </div>
);

const DocImage = ({ src, label }) => {
  if (!src) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <img
        src={src}
        alt={label}
        className="w-full max-w-xs rounded-lg border border-gray-200 object-cover shadow-sm"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
};

const vehicleIcon = (category) => {
  const map = {
    bike: <Bike className="w-4 h-4" />,
    van: <Car className="w-4 h-4" />,
    "mini-truck": <Truck className="w-4 h-4" />,
    truck: <Package className="w-4 h-4" />,
  };
  return map[category?.toLowerCase()] || <Truck className="w-4 h-4" />;
};

const PorterProfile = () => {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError } = useGetPorterByUser();

  const { mutateAsync: updateContact, isPending: isSaving } =
    porterRetgistrationHooks.useUpdatePorterContactMutation();

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const porter = data?.data?.porter[0] || null;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-gray-500">Loading your profile…</p>
        </div>
      </PageLayout>
    );
  }

  if (isError || !porter) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            No Porter Profile Found
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            It looks like you haven't completed your porter registration yet.
          </p>
        </div>
      </PageLayout>
    );
  }

  // Core porter fields
  const { porterType, status } = porter;

  // Personal info
  const basicInfo = porter.porterBasicInfo || {};
  const {
    fullName,
    phone,
    address,
    porterPhoto,
    identityType,
    identityNumber,
  } = basicInfo;

  const idDocArr = basicInfo.registrationIdDocument || [];

  const identityCardImageFront = idDocArr[0]?.identityCardImageFront
    ? getCloudinaryUrl(idDocArr[0].identityCardImageFront)
    : null;
  const identityCardImageBack = idDocArr[0]?.identityCardImageBack
    ? getCloudinaryUrl(idDocArr[0].identityCardImageBack)
    : null;
  const porterPhotoUrl = porterPhoto ? getCloudinaryUrl(porterPhoto) : null;
  // Vehicle
  const vehicle = porter.vehicle || null;

  // Document
  const docInfo = porter.document || null;

  const openEdit = () => {
    setEditPhone(phone || "");
    setEditAddress(address || "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      await updateContact({ phone: editPhone, address: editAddress });
      toast.success("Contact info updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="max-w-full mx-auto px-4 py-6 space-y-6">
        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-[#1A3C3B] to-[#2E6B5E] text-white p-6 shadow-md">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {porterPhotoUrl ? (
                <img
                  src={porterPhotoUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                  <span className="text-3xl font-bold text-white">
                    {fullName?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold capitalize truncate">
                {fullName || user?.name || "Porter"}
              </h1>
              <p className="text-sm text-white/70 mt-0.5">
                {user?.email || ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusBadge status={status} />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 border border-white/20 capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {porterType || "Individual"} Porter
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Personal Information ── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </CardTitle>
                <button
                  onClick={openEdit}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 px-2.5 py-1.5 rounded-lg hover:bg-primary/8 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={fullName}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={phone}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Address"
                value={address}
              />
              <InfoRow
                icon={<Shield className="w-4 h-4" />}
                label="Porter Type"
                value={
                  porterType
                    ? porterType.charAt(0).toUpperCase() + porterType.slice(1)
                    : undefined
                }
              />
            </CardContent>
          </Card>

          {/* ── Identity Details ── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Identity Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Identity Type"
                value={identityType}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label="Identity Number"
                value={identityNumber}
              />
              {/* Citizenship Images */}
              {(identityCardImageFront || identityCardImageBack) && (
                <div className="pt-4 space-y-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                    Citizenship Document
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {identityCardImageFront && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">
                          Front Side
                        </p>
                        <img
                          src={identityCardImageFront}
                          alt="ID Front"
                          className="w-full rounded-lg border border-gray-200 object-cover shadow-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    {identityCardImageBack && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">
                          Back Side
                        </p>
                        <img
                          src={identityCardImageBack}
                          alt="ID Back"
                          className="w-full rounded-lg border border-gray-200 object-cover shadow-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Vehicle ── */}
        {vehicle && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  {vehicleIcon(vehicle.vehicleCategory)}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-800 capitalize">
                    {vehicle.vehicleCategory || "Vehicle"}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400 text-xs">Number: </span>
                    {vehicle.vehicleNumber || "—"}
                  </p>
                  {vehicle.capacity && (
                    <p className="text-gray-600">
                      <span className="text-gray-400 text-xs">Capacity: </span>
                      {vehicle.capacity}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── License / Documents ── */}
        {docInfo && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                License & Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label="License Number"
                value={docInfo.licenseNumber}
              />
              {docInfo.porterLicenseDocument && (
                <div className="pt-3">
                  <DocImage
                    src={
                      docInfo.porterLicenseDocument
                        ? getCloudinaryUrl(docInfo.porterLicenseDocument)
                        : null
                    }
                    label="License Document"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Edit Contact Dialog ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Edit Contact Info
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Only phone and address can be updated.
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-phone"
                className="text-sm font-medium flex items-center gap-2 text-gray-700"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. 9800000000"
                className="w-full"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-address"
                className="text-sm font-medium flex items-center gap-2 text-gray-700"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Address
              </Label>
              <Input
                id="edit-address"
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="e.g. Kathmandu, Nepal"
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleSave}
                disabled={isSaving || (!editPhone && !editAddress)}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default PorterProfile;
